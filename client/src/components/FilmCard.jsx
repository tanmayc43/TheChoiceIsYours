import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { TransitionPresets } from './transition';

const FilmCard = ({ film, onBack }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!film) {
    return null; // Or a loading/error state
  }

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
      {/* This is the main container that enforces a fixed size */}
      <div
        className="w-72 h-[432px] md:w-80 md:h-[480px]" // Fixed width and height
        style={{ perspective: '1200px' }} // Enables 3D space for the flip
      >
        <motion.div
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={TransitionPresets.flip.transition}
        >
          {/* FRONT OF CARD - "Tap to Reveal" */}
          <motion.div
            className="absolute w-full h-full rounded-lg border-2 border-matrix-green/50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center cursor-pointer"
            style={{ backfaceVisibility: 'hidden' }}
            onClick={handleFlip}
          >
            <h3 className="text-2xl font-mono text-matrix-green mb-4">ENCRYPTED DATA</h3>
            <p className="text-white/70 font-mono">Tap to reveal film protocol</p>
            <div className="absolute bottom-4 text-xs text-white/50 font-mono animate-pulse">
              [ INITIATE DECRYPTION ]
            </div>
          </motion.div>

          {/* BACK OF CARD - Film Poster and Details */}
          <motion.div
            className="absolute w-full h-full rounded-lg border-2 border-matrix-green/50 bg-matrix-gray overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Poster Image as Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${film.image})` }}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

            {/* Text Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-4 text-white">
              <h3 className="text-2xl font-bold font-mono text-matrix-green">{film.name}</h3>
              <p className="text-sm font-mono text-white/80 mb-2">{film.year}</p>
              <p className="text-xs font-mono text-white/70 max-h-24 overflow-y-auto custom-scrollbar">
                {film.overview}
              </p>
              <a
                href={film.slug}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-xs text-matrix-green hover:underline"
              >
                View on Letterboxd <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Back Button */}
      <Button onClick={onBack} className="bg-matrix-green text-black hover:bg-matrix-dark-green font-mono">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Run New Scan
      </Button>
    </div>
  );
};

export default FilmCard;