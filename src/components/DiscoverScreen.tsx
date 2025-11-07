import { ArrowLeft, Globe, Phone, Mail, MapPin } from 'lucide-react';
import './DiscoverScreen.css';

interface DiscoverScreenProps {
  onBack: () => void;
}

export default function DiscoverScreen({ onBack }: DiscoverScreenProps) {
  return (
    <div className="discover-screen">
      <div className="discover-container">
        <button onClick={onBack} className="back-button-discover">
          <ArrowLeft size={20} />
          Retour
        </button>

        <img
          className="discover-logo"
          alt="Logo LibertyLoc"
          src="./logo-liberty-loc-1-1.png"
        />

        <h1 className="discover-title">Réussis ton permis bateau avec LibertyLoc</h1>

        <div className="discover-content">
          <section className="discover-section">
            <h2>🎯 Ton partenaire de révision</h2>
            <p>
              LibertyLoc est une application de révision moderne et interactive, 
              spécialement conçue pour t'aider à préparer ton permis bateau côtier 
              avec confiance.
            </p>
          </section>

          <section className="discover-section">
            <h2>💡 Ce que tu vas trouver</h2>
            <ul className="discover-list">
              <li>✅ Des questions par thématique pour réviser à ton rythme</li>
              <li>✅ Des examens blancs pour te mettre en conditions réelles</li>
              <li>✅ Un suivi de ta progression pour mesurer tes progrès</li>
              <li>✅ Un accès mobile pour réviser partout, à tout moment</li>
            </ul>
          </section>

          <section className="discover-section">
            <h2>🎓 Apprendre avec un professionnel</h2>
            <p>
              Cette application a été développée pour accompagner les formations 
              dispensées par Joël Gual, formateur certifié et passionné de nautisme.
            </p>
          </section>

          <div className="contact-section">
            <h2>📞 Contactez votre formateur</h2>
            
            <div className="contact-card">
              <div className="contact-header">
                <h3>Joël Gual - LibertyLoc</h3>
              </div>

              <div className="contact-info">
                <a 
                  href="https://libertyloc.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-item contact-link"
                >
                  <Globe size={20} />
                  <span>libertyloc.fr</span>
                </a>

                <a 
                  href="tel:+33619132592"
                  className="contact-item contact-link"
                >
                  <Phone size={20} />
                  <span>06 19 13 25 92</span>
                </a>

                <a 
                  href="mailto:joel.gual@liberty-loc.com"
                  className="contact-item contact-link"
                >
                  <Mail size={20} />
                  <span>joel.gual@liberty-loc.com</span>
                </a>

                <div className="contact-item">
                  <MapPin size={20} />
                  <span>
                    22 Bis Avenue Augustin Labouilhe<br />
                    31650 Saint-Orens-de-Gameville
                  </span>
                </div>
              </div>

              <a 
                href="https://libertyloc.fr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="visit-website-button"
              >
                Visiter le site web
              </a>
            </div>
          </div>

          <div className="discover-cta">
            <p className="cta-text">
              Prêt à commencer ton aventure nautique ? 
            </p>
            <p className="cta-subtext">
              Contacte Joël pour en savoir plus sur les formations et obtenir tes accès !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
