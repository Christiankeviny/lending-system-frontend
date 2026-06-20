import React, { useRef, useEffect } from 'react';

const WebcamCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        
        if ( videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capture =() => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current,0,0,canvasRef.current.width,canvasRef.current.height);
    
    stopCamera();

    canvasRef.current.toBlob((blob) => { onCapture(blob); }, 'image/jpeg', 0.8);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="bg-white p-4 rounded-lg shadow-xl max-w-2xl w-full">
        <h3 className="text-lg font-bold mb-4">Take the photo card</h3>
        
        <div className="relative bg-gray-200 rounded overflow-hidden aspect-video mb-4 flex justify-center items-center">
          <video className="w-full h-full object-cover" ref={videoRef} autoPlay playsInline></video>
          
          <canvas className="hidden" ref={canvasRef}></canvas>
        </div>

        <div className="flex justify-end space-x-3 mt-4">
          <button onClick={() => {
            stopCamera();
            onCancel();
          }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
            cancel
          </button>
          <button onClick={capture} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Take photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;