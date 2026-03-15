'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail, Globe, Scale, Clock, Users, Database, Cookie, AlertTriangle } from 'lucide-react';

const sectionClass = 'mb-8';
const headingClass = 'font-heading text-xl font-bold text-white mb-4 flex items-center gap-2';
const subheadingClass = 'font-heading text-lg font-semibold text-slate-200 mb-3 mt-5';
const textClass = 'text-slate-300 text-sm leading-relaxed mb-3';
const listClass = 'list-disc list-inside text-slate-300 text-sm leading-relaxed mb-3 space-y-1.5 ml-2';

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="glass rounded-2xl p-8 md:p-12 shadow-2xl border border-slate-700/50">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">
                Politica de Privacidad
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Ultima actualizacion: 15 de marzo de 2026
              </p>
            </div>
          </div>

          <p className={textClass}>
            En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de
            27 de abril de 2016, relativo a la proteccion de las personas fisicas en lo que respecta
            al tratamiento de datos personales (RGPD), y de la Ley Organica 3/2018, de 5 de
            diciembre, de Proteccion de Datos Personales y garantia de los derechos digitales
            (LOPD-GDD), le informamos sobre el tratamiento de sus datos personales.
          </p>

          {/* 1. Responsable del tratamiento */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Scale className="w-5 h-5 text-violet-400" />
              1. Responsable del tratamiento
            </h2>
            <div className="glass rounded-xl p-5 border border-slate-700/30">
              <ul className="text-slate-300 text-sm space-y-2">
                <li><strong className="text-white">Razon social:</strong> QuestMaster S.L.</li>
                <li><strong className="text-white">CIF:</strong> B-XXXXXXXX</li>
                <li><strong className="text-white">Domicilio social:</strong> Calle Ejemplo 123, 28001 Madrid, Espana</li>
                <li><strong className="text-white">Email de contacto:</strong> privacidad@questmaster.es</li>
                <li><strong className="text-white">Delegado de Proteccion de Datos (DPD):</strong> dpd@questmaster.es</li>
                <li><strong className="text-white">Registro Mercantil:</strong> Inscrita en el Registro Mercantil de Madrid</li>
              </ul>
            </div>
          </section>

          {/* 2. Datos que recopilamos */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Database className="w-5 h-5 text-violet-400" />
              2. Datos personales que recopilamos
            </h2>
            <p className={textClass}>
              En funcion de la interaccion del usuario con la plataforma, podremos recopilar las
              siguientes categorias de datos personales:
            </p>

            <h3 className={subheadingClass}>2.1. Datos de registro e identificacion</h3>
            <ul className={listClass}>
              <li>Nombre completo</li>
              <li>Direccion de correo electronico</li>
              <li>Contrasena (almacenada de forma cifrada mediante AWS Cognito)</li>
              <li>Fecha de registro y ultima conexion</li>
            </ul>

            <h3 className={subheadingClass}>2.2. Datos de uso y actividad</h3>
            <ul className={listClass}>
              <li>Progreso en quests y etapas completadas</li>
              <li>Puntuaciones, logros y estadisticas de juego</li>
              <li>Historial de conversaciones con personajes de IA</li>
              <li>Tiempo de juego y patrones de uso</li>
            </ul>

            <h3 className={subheadingClass}>2.3. Datos de voz y conversaciones</h3>
            <ul className={listClass}>
              <li>Transcripciones de conversaciones de voz con personajes de IA</li>
              <li>Resultados de analisis de desafios conversacionales</li>
              <li>Datos de sesion de voz en tiempo real (procesados por OpenAI, no almacenados permanentemente como audio)</li>
            </ul>

            <h3 className={subheadingClass}>2.4. Datos de ubicacion</h3>
            <ul className={listClass}>
              <li>Ubicacion geografica (solo cuando el usuario la comparte activamente para funcionalidades de mapa)</li>
              <li>Datos de proximidad a puntos de interes de las quests</li>
            </ul>

            <h3 className={subheadingClass}>2.5. Datos tecnicos</h3>
            <ul className={listClass}>
              <li>Direccion IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Datos de cookies y tecnologias similares</li>
            </ul>
          </section>

          {/* 3. Base legal */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Scale className="w-5 h-5 text-violet-400" />
              3. Base legal del tratamiento
            </h2>
            <p className={textClass}>
              El tratamiento de sus datos personales se fundamenta en las siguientes bases legales
              conforme al articulo 6 del RGPD:
            </p>
            <div className="space-y-4">
              <div className="glass rounded-xl p-4 border border-violet-500/20">
                <h4 className="text-white font-semibold text-sm mb-1">Ejecucion de contrato (Art. 6.1.b RGPD)</h4>
                <p className="text-slate-300 text-sm">
                  El tratamiento de datos de registro, perfil y actividad es necesario para la
                  prestacion del servicio contratado, incluyendo la gestion de la cuenta, el
                  funcionamiento de quests y el sistema de puntuacion.
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-emerald-500/20">
                <h4 className="text-white font-semibold text-sm mb-1">Consentimiento (Art. 6.1.a RGPD)</h4>
                <p className="text-slate-300 text-sm">
                  Para el tratamiento de datos de ubicacion, la grabacion y analisis de
                  conversaciones de voz con IA, y la instalacion de cookies no esenciales. El
                  consentimiento puede ser retirado en cualquier momento.
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-amber-500/20">
                <h4 className="text-white font-semibold text-sm mb-1">Interes legitimo (Art. 6.1.f RGPD)</h4>
                <p className="text-slate-300 text-sm">
                  Para la mejora del servicio, prevencion del fraude, seguridad de la plataforma y
                  analisis estadisticos anonimizados.
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-slate-500/20">
                <h4 className="text-white font-semibold text-sm mb-1">Obligacion legal (Art. 6.1.c RGPD)</h4>
                <p className="text-slate-300 text-sm">
                  Para el cumplimiento de obligaciones legales, como la conservacion de datos fiscales
                  o la atencion a requerimientos de autoridades competentes.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Finalidades */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Globe className="w-5 h-5 text-violet-400" />
              4. Finalidades del tratamiento
            </h2>
            <ul className={listClass}>
              <li>Gestion de la cuenta de usuario y autenticacion</li>
              <li>Prestacion del servicio de juego interactivo con quests y personajes de IA</li>
              <li>Procesamiento de conversaciones de voz en tiempo real con personajes de IA</li>
              <li>Evaluacion y analisis del rendimiento en desafios</li>
              <li>Gestion del sistema de puntuacion, logros y clasificaciones</li>
              <li>Funcionamiento de la geolocalizacion para quests basadas en ubicacion</li>
              <li>Mejora continua de la plataforma y la experiencia de usuario</li>
              <li>Prevencion del fraude y garantia de la seguridad</li>
              <li>Cumplimiento de obligaciones legales</li>
              <li>Comunicaciones relacionadas con el servicio (no comerciales salvo consentimiento)</li>
            </ul>
          </section>

          {/* 5. Duracion de la conservacion */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Clock className="w-5 h-5 text-violet-400" />
              5. Duracion de la conservacion de datos
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="py-3 pr-4 text-violet-400 font-semibold">Tipo de dato</th>
                    <th className="py-3 text-violet-400 font-semibold">Plazo de conservacion</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4">Datos de cuenta</td>
                    <td className="py-3">Mientras la cuenta este activa + 3 anos tras la baja</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4">Progreso y puntuaciones</td>
                    <td className="py-3">Mientras la cuenta este activa + 1 ano tras la baja</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4">Conversaciones de voz</td>
                    <td className="py-3">Transcripciones: 12 meses. Audio en tiempo real: no se almacena</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4">Datos de ubicacion</td>
                    <td className="py-3">Solo durante la sesion activa. No se almacenan permanentemente</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4">Logs de auditoria</td>
                    <td className="py-3">5 anos (obligacion legal)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Cookies</td>
                    <td className="py-3">Segun el tipo (ver seccion 10)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Destinatarios */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Users className="w-5 h-5 text-violet-400" />
              6. Destinatarios y transferencias internacionales
            </h2>
            <p className={textClass}>
              Sus datos personales podran ser comunicados a los siguientes destinatarios:
            </p>

            <h3 className={subheadingClass}>6.1. Encargados del tratamiento</h3>
            <div className="space-y-3">
              <div className="glass rounded-xl p-4 border border-slate-700/30">
                <h4 className="text-white font-semibold text-sm">Amazon Web Services (AWS)</h4>
                <p className="text-slate-400 text-xs mt-1">
                  Infraestructura cloud, almacenamiento de datos, autenticacion (Cognito), base de
                  datos (DynamoDB). Servidores en la region eu-west-1 (Irlanda, UE). Cumple con el
                  RGPD mediante clausulas contractuales tipo (CCT) aprobadas por la Comision Europea.
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-slate-700/30">
                <h4 className="text-white font-semibold text-sm">OpenAI, Inc.</h4>
                <p className="text-slate-400 text-xs mt-1">
                  Procesamiento de conversaciones de voz en tiempo real con personajes de IA.
                  Transferencia internacional a EE.UU. amparada por clausulas contractuales tipo
                  (CCT) y el marco EU-US Data Privacy Framework. Los datos de audio no se almacenan
                  permanentemente por OpenAI.
                </p>
              </div>
              <div className="glass rounded-xl p-4 border border-slate-700/30">
                <h4 className="text-white font-semibold text-sm">Amazon Bedrock (AWS)</h4>
                <p className="text-slate-400 text-xs mt-1">
                  Analisis y evaluacion de desafios conversacionales. Procesado dentro de la UE
                  (eu-west-1). Los datos no se utilizan para entrenar modelos de IA.
                </p>
              </div>
            </div>

            <h3 className={subheadingClass}>6.2. Otros destinatarios</h3>
            <p className={textClass}>
              No se cederan datos a terceros salvo obligacion legal. Los datos de clasificaciones
              (leaderboard) son visibles para otros usuarios registrados (nombre y puntuacion, sin
              datos de contacto).
            </p>
          </section>

          {/* 7. Derechos ARCO+ */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Shield className="w-5 h-5 text-violet-400" />
              7. Derechos del interesado (ARCO+)
            </h2>
            <p className={textClass}>
              Conforme al RGPD y la LOPD-GDD, usted tiene los siguientes derechos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: 'Acceso', desc: 'Conocer si tratamos sus datos y obtener una copia de los mismos.' },
                { title: 'Rectificacion', desc: 'Solicitar la correccion de datos inexactos o incompletos.' },
                { title: 'Supresion', desc: 'Solicitar la eliminacion de sus datos cuando ya no sean necesarios (derecho al olvido).' },
                { title: 'Oposicion', desc: 'Oponerse al tratamiento de sus datos en determinadas circunstancias.' },
                { title: 'Portabilidad', desc: 'Recibir sus datos en formato estructurado y de uso comun (JSON).' },
                { title: 'Limitacion', desc: 'Solicitar la limitacion del tratamiento en determinados supuestos.' },
              ].map((right) => (
                <div key={right.title} className="glass rounded-xl p-4 border border-violet-500/10">
                  <h4 className="text-violet-400 font-semibold text-sm mb-1">{right.title}</h4>
                  <p className="text-slate-400 text-xs">{right.desc}</p>
                </div>
              ))}
            </div>

            <p className={`${textClass} mt-4`}>
              Para ejercer estos derechos, puede:
            </p>
            <ul className={listClass}>
              <li>Utilizar la seccion &quot;Mis datos&quot; en su perfil de usuario para descargar o eliminar sus datos</li>
              <li>Enviar un correo electronico a <strong className="text-violet-400">privacidad@questmaster.es</strong> indicando el derecho que desea ejercer, junto con una copia de su DNI/NIE</li>
              <li>Contactar con nuestro Delegado de Proteccion de Datos en <strong className="text-violet-400">dpd@questmaster.es</strong></li>
            </ul>
            <p className={textClass}>
              El plazo maximo de respuesta es de <strong className="text-white">un mes</strong> desde
              la recepcion de la solicitud, prorrogable otros dos meses en casos de especial
              complejidad.
            </p>
          </section>

          {/* 8. DPD */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Mail className="w-5 h-5 text-violet-400" />
              8. Delegado de Proteccion de Datos
            </h2>
            <p className={textClass}>
              QuestMaster S.L. ha designado un Delegado de Proteccion de Datos al que puede dirigirse
              para cualquier cuestion relacionada con el tratamiento de sus datos personales:
            </p>
            <div className="glass rounded-xl p-4 border border-slate-700/30">
              <p className="text-slate-300 text-sm">
                <strong className="text-white">Email:</strong> dpd@questmaster.es
              </p>
              <p className="text-slate-300 text-sm mt-1">
                <strong className="text-white">Direccion postal:</strong> QuestMaster S.L., Att.
                Delegado de Proteccion de Datos, Calle Ejemplo 123, 28001 Madrid, Espana
              </p>
            </div>
          </section>

          {/* 9. AEPD */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <AlertTriangle className="w-5 h-5 text-violet-400" />
              9. Derecho de reclamacion ante la AEPD
            </h2>
            <p className={textClass}>
              Si considera que el tratamiento de sus datos personales no se ajusta a la normativa
              vigente, tiene derecho a presentar una reclamacion ante la Agencia Espanola de
              Proteccion de Datos (AEPD):
            </p>
            <div className="glass rounded-xl p-4 border border-slate-700/30">
              <ul className="text-slate-300 text-sm space-y-1">
                <li><strong className="text-white">Web:</strong>{' '}
                  <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                    www.aepd.es
                  </a>
                </li>
                <li><strong className="text-white">Direccion:</strong> C/ Jorge Juan 6, 28001 Madrid</li>
                <li><strong className="text-white">Telefono:</strong> 901 100 099 / 91 266 35 17</li>
              </ul>
            </div>
          </section>

          {/* 10. Cookies */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              <Cookie className="w-5 h-5 text-violet-400" />
              10. Politica de cookies
            </h2>
            <p className={textClass}>
              Esta plataforma utiliza cookies y tecnologias similares. A continuacion se detallan las
              cookies utilizadas:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="py-3 pr-4 text-violet-400 font-semibold">Cookie</th>
                    <th className="py-3 pr-4 text-violet-400 font-semibold">Tipo</th>
                    <th className="py-3 pr-4 text-violet-400 font-semibold">Finalidad</th>
                    <th className="py-3 text-violet-400 font-semibold">Duracion</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4 font-mono text-xs">CognitoIdentityServiceProvider.*</td>
                    <td className="py-3 pr-4">Necesaria</td>
                    <td className="py-3 pr-4">Autenticacion y sesion de usuario</td>
                    <td className="py-3">Sesion / 30 dias</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4 font-mono text-xs">qm_cookie_consent</td>
                    <td className="py-3 pr-4">Necesaria</td>
                    <td className="py-3 pr-4">Almacenar preferencias de cookies del usuario</td>
                    <td className="py-3">12 meses</td>
                  </tr>
                  <tr className="border-b border-slate-700/20">
                    <td className="py-3 pr-4 font-mono text-xs">qm_analytics</td>
                    <td className="py-3 pr-4">Analitica</td>
                    <td className="py-3 pr-4">Analisis de uso y mejora del servicio</td>
                    <td className="py-3">12 meses</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-xs">qm_preferences</td>
                    <td className="py-3 pr-4">Funcional</td>
                    <td className="py-3 pr-4">Preferencias de usuario (tema, idioma)</td>
                    <td className="py-3">12 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={`${textClass} mt-3`}>
              Puede gestionar sus preferencias de cookies en cualquier momento a traves del banner de
              cookies o desde la configuracion de su navegador.
            </p>
          </section>

          {/* 11. Modificaciones */}
          <section className={sectionClass}>
            <h2 className={headingClass}>
              11. Modificaciones de esta politica
            </h2>
            <p className={textClass}>
              QuestMaster S.L. se reserva el derecho a modificar la presente politica de privacidad
              para adaptarla a novedades legislativas o jurisprudenciales. En caso de cambios
              sustanciales, se notificara a los usuarios mediante un aviso en la plataforma o por
              correo electronico.
            </p>
          </section>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-500 text-xs">
              QuestMaster S.L. - Todos los derechos reservados - Ultima actualizacion: marzo 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
