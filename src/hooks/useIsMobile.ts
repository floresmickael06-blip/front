import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si l'utilisateur est sur mobile
 * Utilise à la fois la détection d'écran et le User Agent
 * @param breakpoint - Largeur d'écran pour considérer mobile (défaut: 1024px)
 */
export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Vérifier la largeur de l'écran
      const isSmallScreen = window.innerWidth < breakpoint;
      
      // Vérifier le User Agent pour les appareils mobiles
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Vérifier si c'est un écran tactile
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Considérer mobile si : petit écran OU (appareil mobile ET tactile)
      setIsMobile(isSmallScreen || (isMobileDevice && isTouchDevice));
    };

    // Vérifier au montage
    checkIsMobile();

    // Écouter les changements de taille d'écran
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}
