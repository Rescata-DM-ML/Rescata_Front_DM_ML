import { useNavigate } from 'react-router-dom';
import './AvisoPrivacidad.css';

export default function AvisoPrivacidad() {
  const navigate = useNavigate();

  return (
    <div className="aviso-page-container">
      <div className="aviso-card">
        <div className="aviso-header">
          <div className="logo-container">
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="brand-name">RESCATA</span>
          </div>
          <h1>Aviso de Privacidad</h1>
        </div>

        <div className="aviso-content">
          <section className="aviso-section">
            <h2>Identidad del Responsable</h2>
            <p>
              RESCATA Plataforma Web, con domicilio en Dolores Hidalgo C.I.N., Guanajuato México, es responsable del tratamiento y protección de sus datos personales, conforme a lo establecido en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Datos que Recabamos</h2>
            <p>Recabamos los siguientes datos personales:</p>
            <ul className="aviso-list">
              <li>nombre</li>
              <li>correo electrónico</li>
              <li>contraseña (almacenada de forma encriptada)</li>
              <li>rol de usuario (consumidor o negocio)</li>
              <li>fecha de registro y timestamp de consentimiento de privacidad</li>
            </ul>
          </section>

          <section className="aviso-section">
            <h2>Finalidad del Tratamiento</h2>
            <p>
              Sus datos personales serán utilizados para: crear y administrar su cuenta dentro de la plataforma, conectar negocios locales con consumidores interesados en productos próximos a su fecha de caducidad o con descuento, enviar notificaciones personalizadas sobre ofertas disponibles en su zona, generar estadísticas de impacto para reducir el desperdicio alimentario, y brindar atención al usuario. Sus datos no serán utilizados para finalidades distintas a las aquí descritas sin su consentimiento previo.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Transferencia de Datos</h2>
            <p>
              Sus datos personales no serán transferidos a terceros sin su consentimiento expreso, salvo que exista una obligación legal que así lo requiera.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Derechos ARCO</h2>
            <p>
              Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Para ejercer cualquiera de estos derechos, envíe una solicitud al correo: <a href="mailto:privacidad@rescata.mx" className="aviso-link">privacidad@rescata.mx</a>, indicando su nombre completo, datos de contacto y el derecho que desea ejercer. Su solicitud será atendida en un plazo máximo de 20 días hábiles contados a partir de su recepción.
            </p>
          </section>

          <section className="aviso-section">
            <h2>Cambios al Aviso</h2>
            <p>
              Cualquier modificación al presente aviso de privacidad será notificada oportunamente a través de la plataforma o por correo electrónico registrado.
            </p>
          </section>
        </div>

        <div className="aviso-footer">
          <p className="aviso-date">Última actualización: junio 2026</p>
          <button onClick={() => navigate(-1)} className="aviso-back-btn">
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
}
