const express = require('express');
const Stream = require('node-rtsp-stream');
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const app = express();

// Automatically find and use portable FFmpeg
if (ffmpegStatic) {
  const ffmpegDir = path.dirname(ffmpegStatic);
  process.env.PATH = `${ffmpegDir};${process.env.PATH}`;
  ffmpeg.setFfmpegPath(ffmpegStatic);
  console.log(`[System] FFmpeg Path set to: ${ffmpegStatic}`);
}


// ============================================================================
// 1. LIVE STREAM MANAGER
// مخصص لإدارة البث المباشر المزامَن
// ============================================================================
class LiveStreamManager {
  constructor() {
    this.streams = new Map();
  }

  startDvr(ip, user, pass, channelCount) {
    this.stopAll(); // إيقاف كل البث الحي القديم
    
    const cameras = [];
    const portStart = 9991; // بورتات البث المباشر تبدأ من 9991

    for (let i = 1; i <= channelCount; i++) {
      const wsPort = portStart + (i - 1);
      const name = `Camera ${i}`;
      // رابط البث الحي المعتاد
      const url = `rtsp://${user}:${pass}@${ip}:554/mode=real&idc=${i}&ids=1`;
      
      try {
        const stream = new Stream({
          name: name,
          streamUrl: url,
          wsPort: wsPort,
          ffmpegOptions: {
            '-stats': '',
            '-r': 25,
            '-s': '1280x720',
            '-b:v': '4000k',
            '-q:v': 2,
            '-bf': '0'
          }
        });
        
        this.streams.set(wsPort, stream);
        cameras.push({
          id: `cam_${i}`,
          name: name,
          wsPort: wsPort,
          status: "online"
        });
        console.log(`[LiveStream] Started ${name} on port ${wsPort}`);
      } catch (err) {
        console.error(`[LiveStream] Failed to start ${name}: ${err.message}`);
      }
    }
    return cameras;
  }

  stopAll() {
    for (const [port, stream] of this.streams) {
      try {
        stream.stop();
        console.log(`[LiveStream] Stopped stream on port ${port}`);
      } catch (e) {}
    }
    this.streams.clear();
  }
}

const liveManager = new LiveStreamManager();


// ============================================================================
// 2. PLAYBACK STREAM MANAGER
// مخصص لعرض التسجيلات وإدارة منافذ البحث التاريخي
// ============================================================================
class PlaybackStreamManager {
  constructor() {
    this.streams = new Map();
    this.nextPort = 9950; // بورتات التسجيلات منفصلة تبدأ من 9950
  }

  startPlayback(ip, user, pass, channel, date, time) {
    // إيقاف أي بث تسجيلات قديم لتوفير الموارد وتقليل الضغط
    for (const [port, stream] of this.streams.entries()) {
      try { stream.stop(); } catch(e) {}
      this.streams.delete(port);
      console.log(`[Playback] Stopped old playback on port ${port}`);
    }
    
    // تخصيص منفذ ذكي للهروب من مشكلة (EADDRINUSE)
    const wsPort = this.nextPort++;
    if (this.nextPort > 9980) this.nextPort = 9950;
    
    const name = `Playback Cam ${channel}`;
    const formattedDate = date.replace(/-/g, ''); // 2026-04-01 -> 20260401
    const formattedTime = time.replace(/:/g, ''); // 12:00:00 -> 120000

    // ------------------------------------------------------------------------
    // روابط جلب التسجيلات للـ DVR 
    // يختلف الرابط حسب شركة الـ DVR الذي تستخدمه. قم بفك التعليق عن نوع جهازك.
    // ------------------------------------------------------------------------
    
    // 1- نظام XMEye / أجهزة صينية عامة (الافتراضي)
    let url = `rtsp://${user}:${pass}@${ip}:554/playback?channel=${channel}&starttime=${formattedDate}_${formattedTime}`;
    
    // 2- نظام Dahua
    // let url = `rtsp://${user}:${pass}@${ip}:554/cam/playback?channel=${channel}&subtype=0&starttime=${date.replace(/-/g,'_')}_${time.replace(/:/g,'_')}`;
    
    // 3- نظام Hikvision
    // let url = `rtsp://${user}:${pass}@${ip}:554/Streaming/tracks/${channel}01?starttime=${formattedDate}T${formattedTime}Z`;

    try {
      const stream = new Stream({
        name: name,
        streamUrl: url,
        wsPort: wsPort,
        ffmpegOptions: {
          '-stats': '',
          '-r': 25,
          '-s': '1280x720',
          '-b:v': '4000k',
          '-q:v': 2,
          '-bf': '0'
        }
      });
      
      this.streams.set(wsPort, stream);
      console.log(`[Playback] Started ${name} on port ${wsPort} for time ${date} ${time}`);
      
      return {
        id: `pb_${channel}_${Date.now()}`,
        name: name,
        wsPort: wsPort,
        status: "recording",
        streamUrl: `ws://localhost:${wsPort}`
      };
    } catch (err) {
      console.error(`[Playback] Failed to start: ${err.message}`);
      throw err;
    }
  }
}

const playbackManager = new PlaybackStreamManager();


// ============================================================================
// 3. EXPRESS API ROUTES
// المسارات الخاصة بتواصل واجهة المستخدم مع السيرفر
// ============================================================================
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// مسیر بدء البث المباشر
app.post('/api/setup', (req, res) => {
  const { ip, user, pass, channels } = req.body;
  if (!ip || !user || !pass) {
    return res.status(400).json({ success: false, message: "Missing DVR credentials." });
  }
  try {
    const cameras = liveManager.startDvr(ip, user, pass, channels || 4);
    res.json({ success: true, cameras: cameras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// مسار بدء تشغيل البث المسجل (Playback)
app.post('/api/playback', (req, res) => {
  const { ip, user, pass, channel, date, time } = req.body;
  if (!ip || !user || !pass || !channel || !date || !time) {
    return res.status(400).json({ success: false, message: "Missing required playback parameters." });
  }
  try {
    const camera = playbackManager.startPlayback(ip, user, pass, channel, date, time);
    res.json({ success: true, camera: camera });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Legacy connect endpoint
app.get('/api/connect', (req, res) => {
  res.json({ success: true, message: "Engine is Online. Use /api/setup for multi-camera." });
});

// ============================================================================
// START SERVER
// ============================================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 CCTV BACKEND ENGINE RUNNING ON PORT ${PORT}`);
  console.log(`-----------------------------------------------`);
});
