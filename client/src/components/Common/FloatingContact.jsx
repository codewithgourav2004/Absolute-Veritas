import React from 'react';

const PHONE = '917042289480';
const WA_MESSAGE = encodeURIComponent('Hi I want to enquire about your products and services.');

export default function FloatingContact() {
  return (
    <div className="fixed left-4 bottom-24 z-50 flex flex-col gap-3">
      {/* WhatsApp button */}
      <a
        href={`https://wa.me/${PHONE}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110"
        style={{ width: 54, height: 54, backgroundColor: '#E63946' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
          <path fill="#25D366" d="M16 2C8.268 2 2 8.268 2 16c0 2.47.67 4.785 1.836 6.77L2 30l7.438-1.8A13.93 13.93 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.9-1.614l-.422-.252-4.416 1.068 1.1-4.298-.276-.44A11.6 11.6 0 014.4 16C4.4 9.593 9.593 4.4 16 4.4S27.6 9.593 27.6 16 22.407 27.6 16 27.6zm6.36-8.676c-.348-.174-2.06-1.016-2.38-1.132-.32-.116-.552-.174-.784.174-.232.348-.9 1.132-1.104 1.364-.204.232-.406.26-.754.086-.348-.174-1.47-.542-2.8-1.726-1.034-.922-1.732-2.06-1.934-2.408-.204-.348-.022-.536.152-.71.158-.156.348-.406.522-.61.174-.202.232-.348.348-.58.116-.232.058-.436-.03-.61-.086-.174-.784-1.888-1.074-2.586-.282-.68-.57-.588-.784-.598l-.668-.012c-.232 0-.61.086-.928.436-.32.348-1.218 1.19-1.218 2.902 0 1.712 1.247 3.366 1.42 3.598.174.232 2.454 3.746 5.946 5.254.832.358 1.48.572 1.986.732.834.266 1.594.228 2.194.138.67-.1 2.06-.842 2.35-1.656.29-.814.29-1.512.204-1.656-.086-.144-.32-.232-.668-.406z"/>
        </svg>
      </a>

      {/* Call button */}
      <a
        href="tel:+917042289480"
        aria-label="Call us"
        className="flex items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110"
        style={{ width: 54, height: 54, backgroundColor: '#E63946' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26">
          <path fill="#ffffff" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
        </svg>
      </a>
    </div>
  );
}
