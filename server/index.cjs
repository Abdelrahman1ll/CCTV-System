const Stream = require('node-rtsp-stream');

// الإعدادات: استبدل الروابط أدناه بروابط RTSP الخاصة بجهاز الـ DVR لديك
const cameras = [
  {
    name: 'Test Pattern',
    url: 'rtsp://rtsp.stream/pattern', // رابط تجريبي للتأكد من أن النظام يعمل
    wsPort: 9991
  },
  {
    name: 'Camera 1',
    // هنا تضع رابط الـ RTSP الخاص بالكاميرا الأولى
    // admin هو اسم المستخدم، password هي كلمة المرور، و 192.168.1.100 هو عنوان الـ DVR
    url: 'rtsp://admin:password@192.168.1.100:554/Streaming/Channels/101', 
    wsPort: 9992 // كل كاميرا يجب أن يكون لها منفذ (Port) مختلف (9991, 9992, 9993...)
  }
];

cameras.forEach(cam => {
  try {
    const stream = new Stream({
      name: cam.name,
      streamUrl: cam.url,
      wsPort: cam.wsPort,
      ffmpegOptions: {
        '-stats': '',
        '-r': 30
      }
    });
    console.log(`Started proxy for ${cam.name} on ws://localhost:${cam.wsPort}`);
  } catch (err) {
    console.error(`Error starting stream for ${cam.name}:`, err.message);
  }
});
