'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

const sectionClass = 'mb-8';
const headingClass = 'font-heading text-xl font-bold text-white mb-4';
const subheadingClass = 'font-heading text-lg font-semibold text-slate-200 mb-3 mt-5';
const textClass = 'text-slate-300 text-sm leading-relaxed mb-3';
const listClass = 'list-disc list-inside text-slate-300 text-sm leading-relaxed mb-3 space-y-1.5 ml-2';

export default function TermsOfServicePage() {
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
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">
                Terminos y Condiciones de Uso
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Ultima actualizacion: 15 de marzo de 2026
              </p>
            </div>
          </div>

          {/* 1. Objeto y ambito */}
          <section className={sectionClass}>
            <h2 className={headingClass}>1. Objeto y ambito de aplicacion</h2>
            <p className={textClass}>
              Los presentes Terminos y Condiciones de Uso (en adelante, &quot;Terminos&quot;) regulan
              el acceso y uso de la plataforma QuestMaster (en adelante, la &quot;Plataforma&quot;),
              titularidad de QuestMaster S.L. (en adelante, &quot;QuestMaster&quot;), con CIF
              B-XXXXXXXX y domicilio social en Calle Ejemplo 123, 28001 Madrid, Espana.
            </p>
            <p className={textClass}>
              El acceso y uso de la Plataforma implica la aceptacion plena y sin reservas de estos
              Terminos. Si no esta de acuerdo con alguno de ellos, le rogamos que no utilice la
              Plataforma.
            </p>
            <p className={textClass}>
              Estos Terminos se aplican a todos los usuarios de la Plataforma, tanto a traves de la
              aplicacion web como de la aplicacion movil, en cualquier version disponible.
            </p>
          </section>

          {/* 2. Registro y cuenta */}
          <section className={sectionClass}>
            <h2 className={headingClass}>2. Registro y cuenta de usuario</h2>

            <h3 className={subheadingClass}>2.1. Requisitos de registro</h3>
            <ul className={listClass}>
              <li>Ser mayor de 16 anos (o contar con autorizacion del tutor legal conforme al articulo 7 de la LOPD-GDD)</li>
              <li>Proporcionar informacion veraz, completa y actualizada</li>
              <li>Aceptar la Politica de Privacidad y estos Terminos de Uso</li>
              <li>Crear una contrasena segura que cumpla los requisitos minimos de la plataforma</li>
            </ul>

            <h3 className={subheadingClass}>2.2. Responsabilidad de la cuenta</h3>
            <p className={textClass}>
              El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
              Cualquier actividad realizada desde su cuenta se presumira realizada por el titular. El
              usuario debe notificar inmediatamente a QuestMaster cualquier uso no autorizado de su
              cuenta mediante el correo soporte@questmaster.es.
            </p>

            <h3 className={subheadingClass}>2.3. Suspension y cancelacion</h3>
            <p className={textClass}>
              QuestMaster se reserva el derecho de suspender o cancelar cuentas de usuario que
              incumplan estos Terminos, previo aviso al usuario salvo en casos de urgencia. El
              usuario puede cancelar su cuenta en cualquier momento desde la seccion &quot;Mis
              datos&quot; de su perfil.
            </p>
          </section>

          {/* 3. Uso de la plataforma */}
          <section className={sectionClass}>
            <h2 className={headingClass}>3. Uso de la Plataforma</h2>

            <h3 className={subheadingClass}>3.1. Usos permitidos</h3>
            <p className={textClass}>
              La Plataforma esta destinada al entretenimiento a traves de quests interactivas con
              personajes de inteligencia artificial, exploracion de ubicaciones y desafios
              conversacionales. El usuario se compromete a utilizar la Plataforma de buena fe y
              conforme a la legalidad vigente.
            </p>

            <h3 className={subheadingClass}>3.2. Usos prohibidos</h3>
            <p className={textClass}>Queda expresamente prohibido:</p>
            <ul className={listClass}>
              <li>Utilizar la Plataforma con fines ilicitos o contrarios a estos Terminos</li>
              <li>Intentar acceder a cuentas de otros usuarios o a areas restringidas del sistema</li>
              <li>Manipular puntuaciones, logros o clasificaciones de forma fraudulenta</li>
              <li>Utilizar bots, scripts automatizados o herramientas de scraping</li>
              <li>Realizar ingenieria inversa, descompilar o intentar obtener el codigo fuente</li>
              <li>Difundir contenido ofensivo, difamatorio, discriminatorio o ilegal a traves de las conversaciones de voz</li>
              <li>Interferir con el funcionamiento normal de la Plataforma o sus servidores</li>
              <li>Suplantar la identidad de otras personas o entidades</li>
              <li>Compartir credenciales de acceso con terceros</li>
            </ul>

            <h3 className={subheadingClass}>3.3. Funcionalidades de voz e IA</h3>
            <p className={textClass}>
              Las conversaciones de voz con personajes de IA son procesadas en tiempo real. Los
              personajes de IA son ficticios y sus respuestas son generadas automaticamente. QuestMaster
              no garantiza la exactitud de la informacion proporcionada por los personajes de IA. Las
              transcripciones podran ser analizadas para evaluar el desempeno en los desafios.
            </p>
          </section>

          {/* 4. Propiedad intelectual */}
          <section className={sectionClass}>
            <h2 className={headingClass}>4. Propiedad intelectual e industrial</h2>

            <h3 className={subheadingClass}>4.1. Derechos de QuestMaster</h3>
            <p className={textClass}>
              Todos los contenidos de la Plataforma (incluyendo, sin limitacion, textos, graficos,
              imagenes, logos, iconos, software, codigo fuente, diseno de quests, personajes,
              historias y la estructura de la base de datos) estan protegidos por las leyes de
              propiedad intelectual e industrial y son titularidad de QuestMaster S.L. o de sus
              licenciantes.
            </p>

            <h3 className={subheadingClass}>4.2. Licencia de uso</h3>
            <p className={textClass}>
              QuestMaster otorga al usuario una licencia limitada, no exclusiva, intransferible y
              revocable para utilizar la Plataforma conforme a estos Terminos. Esta licencia no
              incluye el derecho a sublicenciar, reproducir, distribuir o crear obras derivadas.
            </p>

            <h3 className={subheadingClass}>4.3. Contenido del usuario</h3>
            <p className={textClass}>
              El usuario conserva la titularidad sobre el contenido que genere (como conversaciones
              con personajes de IA). No obstante, otorga a QuestMaster una licencia no exclusiva
              para utilizar dicho contenido con el fin de prestar y mejorar el servicio.
            </p>
          </section>

          {/* 5. Responsabilidades */}
          <section className={sectionClass}>
            <h2 className={headingClass}>5. Limitacion de responsabilidad</h2>

            <h3 className={subheadingClass}>5.1. Disponibilidad del servicio</h3>
            <p className={textClass}>
              QuestMaster se esfuerza por mantener la Plataforma disponible de forma continuada, pero
              no garantiza la ausencia de interrupciones, errores o fallos tecnicos. QuestMaster no
              sera responsable de los danos derivados de la indisponibilidad temporal del servicio
              por razones de mantenimiento, actualizacion o causas ajenas a su control.
            </p>

            <h3 className={subheadingClass}>5.2. Limitacion</h3>
            <p className={textClass}>
              En la maxima medida permitida por la ley, QuestMaster no sera responsable de danos
              indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad
              de uso de la Plataforma. La responsabilidad total de QuestMaster estara limitada al
              importe pagado por el usuario en los ultimos 12 meses, en caso de servicios de pago.
            </p>

            <h3 className={subheadingClass}>5.3. Contenido de IA</h3>
            <p className={textClass}>
              Los personajes de IA y sus respuestas son generados por modelos de inteligencia
              artificial. QuestMaster no garantiza la exactitud, integridad o adecuacion de las
              respuestas generadas por IA. El usuario reconoce que interactua con personajes ficticios
              y que no debe tomar decisiones basadas unicamente en la informacion proporcionada por
              estos.
            </p>
          </section>

          {/* 6. Proteccion de datos */}
          <section className={sectionClass}>
            <h2 className={headingClass}>6. Proteccion de datos personales</h2>
            <p className={textClass}>
              El tratamiento de datos personales se rige por nuestra{' '}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300 underline">
                Politica de Privacidad
              </Link>
              , que forma parte integrante de estos Terminos. Le recomendamos su lectura detallada
              antes de registrarse en la Plataforma.
            </p>
            <p className={textClass}>
              QuestMaster cumple con el Reglamento General de Proteccion de Datos (RGPD) y la Ley
              Organica 3/2018 de Proteccion de Datos Personales y garantia de los derechos digitales
              (LOPD-GDD). El usuario puede ejercer sus derechos ARCO+ (acceso, rectificacion,
              supresion, oposicion, portabilidad y limitacion) en cualquier momento.
            </p>
          </section>

          {/* 7. Modificaciones */}
          <section className={sectionClass}>
            <h2 className={headingClass}>7. Modificacion de los Terminos</h2>
            <p className={textClass}>
              QuestMaster se reserva el derecho de modificar estos Terminos en cualquier momento. Los
              cambios se comunicaran a los usuarios mediante un aviso en la Plataforma y/o por correo
              electronico con al menos 30 dias de antelacion. El uso continuado de la Plataforma tras
              la notificacion de los cambios implicara la aceptacion de los nuevos Terminos.
            </p>
            <p className={textClass}>
              Si el usuario no esta de acuerdo con las modificaciones, podra cancelar su cuenta sin
              coste alguno antes de la entrada en vigor de los nuevos Terminos.
            </p>
          </section>

          {/* 8. Jurisdiccion */}
          <section className={sectionClass}>
            <h2 className={headingClass}>8. Legislacion aplicable y jurisdiccion</h2>
            <p className={textClass}>
              Estos Terminos se rigen por la legislacion espanola. Para cualquier controversia
              derivada de la interpretacion o ejecucion de estos Terminos, las partes se someten a
              los Juzgados y Tribunales de Madrid (Espana), sin perjuicio de los derechos que la
              normativa de proteccion de consumidores pueda otorgar al usuario.
            </p>
            <p className={textClass}>
              En cumplimiento del articulo 14 del Reglamento (UE) 524/2013, le informamos de que la
              Comision Europea facilita una plataforma de resolucion de litigios en linea disponible
              en:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>

          {/* 9. Disposiciones generales */}
          <section className={sectionClass}>
            <h2 className={headingClass}>9. Disposiciones generales</h2>

            <h3 className={subheadingClass}>9.1. Nulidad parcial</h3>
            <p className={textClass}>
              Si alguna clausula de estos Terminos fuera declarada nula o inaplicable, las restantes
              clausulas mantendran su plena vigencia y eficacia.
            </p>

            <h3 className={subheadingClass}>9.2. No renuncia</h3>
            <p className={textClass}>
              El hecho de que QuestMaster no ejerza un derecho recogido en estos Terminos no supone
              la renuncia al mismo.
            </p>

            <h3 className={subheadingClass}>9.3. Acuerdo completo</h3>
            <p className={textClass}>
              Estos Terminos, junto con la Politica de Privacidad, constituyen el acuerdo completo
              entre el usuario y QuestMaster en relacion con el uso de la Plataforma.
            </p>
          </section>

          {/* 10. Contacto */}
          <section className={sectionClass}>
            <h2 className={headingClass}>10. Contacto</h2>
            <p className={textClass}>
              Para cualquier consulta relacionada con estos Terminos, puede ponerse en contacto con
              nosotros:
            </p>
            <div className="glass rounded-xl p-4 border border-slate-700/30">
              <ul className="text-slate-300 text-sm space-y-1">
                <li><strong className="text-white">Email:</strong> legal@questmaster.es</li>
                <li><strong className="text-white">Direccion:</strong> QuestMaster S.L., Calle Ejemplo 123, 28001 Madrid, Espana</li>
              </ul>
            </div>
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
