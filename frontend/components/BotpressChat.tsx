import React, { useEffect } from 'react';
import { Bot, MessageCircle } from 'lucide-react';

interface BotpressChatProps {
  embedded?: boolean;
}

export const BotpressChat: React.FC<BotpressChatProps> = ({ embedded = false }) => {
  useEffect(() => {
    console.log('BotpressChat: Initializing...');

    // Initialize webchat after scripts load (scripts are now loaded in index.html)
    const initWebchat = () => {
      console.log('BotpressChat: Attempting to initialize webchat...');
      console.log('window.botpressWebChat exists:', !!window.botpressWebChat);
      if (window.botpressWebChat && typeof window.botpressWebChat.init === 'function') {
        console.log('BotpressChat: Initializing webchat...');
        window.botpressWebChat.init({
          // Botpress configuration can be customized here if needed
        });
        console.log('BotpressChat: Webchat initialized successfully');
      } else {
        console.log('BotpressChat: Webchat not ready yet');
      }
    };

    // Wait for scripts to load and initialize
    const checkScriptsLoaded = setInterval(() => {
      console.log('BotpressChat: Checking if scripts are loaded...');
      if (window.botpressWebChat) {
        console.log('BotpressChat: Scripts loaded, initializing...');
        clearInterval(checkScriptsLoaded);
        initWebchat();
      }
    }, 500);

    return () => {
      console.log('BotpressChat: Cleaning up...');
      clearInterval(checkScriptsLoaded);
    };
  }, []);

  if (embedded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Botpress Chat cargando...</p>
        </div>
      </div>
    );
  }

  return null; // Botpress chat is handled by the scripts automatically
};

// Type declaration for Botpress webchat
declare global {
  interface Window {
    botpressWebChat?: {
      init: (config?: any) => void;
    };
  }
}