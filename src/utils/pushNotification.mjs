import { notificationAPI } from "./api.mjs";

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  //regex regexan 
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPushNotifications(identifier, userType) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported by this browser.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied.');
      return;
    }

    // Register the service worker first
    await navigator.serviceWorker.register('/service-worker.js');
    
    // Wait for the service worker to be fully ACTIVE before subscribing
    const registration = await navigator.serviceWorker.ready;
    console.log('Service Worker active with scope:', registration.scope);

    // Check if there is already a subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
      console.log('Push subscription created:', subscription);
    }

    // Send subscription to backend
    await notificationAPI.subscribe({
      identifier,
      userType,
      subscription
    });
    console.log('Subscription sent to backend successfully.');
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
}
