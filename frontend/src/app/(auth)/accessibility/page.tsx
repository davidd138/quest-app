'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Accessibility,
  Keyboard,
  Eye,
  Monitor,
  Sun,
  Focus,
  Tags,
  SkipForward,
  Globe,
  AlertTriangle,
  Mail,
  Calendar,
  ExternalLink,
  CheckCircle2,
  ArrowLeft,
  Shield,
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

function FeatureCard({ icon: Icon, title, description, iconColor, iconBg }: FeatureCardProps) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-colors">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="font-heading font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Volver al inicio</span>
          </Link>
          <Link href="/" className="font-heading font-bold text-white text-lg">
            QuestMaster
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Title section */}
        <motion.div {...fadeIn} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Accessibility className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Accesibilidad</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Declaracion de Accesibilidad
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            En QuestMaster, nos comprometemos a garantizar que nuestra plataforma sea accesible
            para todas las personas, independientemente de sus capacidades o de la tecnologia
            de asistencia que utilicen.
          </p>
        </motion.div>

        {/* Compliance statement */}
        <motion.section
          {...fadeIn}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl border border-white/10 p-8 mb-10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white mb-3">
                Cumplimiento WCAG 2.1 Nivel AA
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                QuestMaster se esfuerza por cumplir con las Pautas de Accesibilidad para el
                Contenido Web (WCAG) 2.1 a nivel AA. Estas pautas explican como hacer que
                el contenido web sea mas accesible para personas con discapacidad. El cumplimiento
                de estas pautas nos ayuda a garantizar que la plataforma sea accesible para
                el mayor numero de personas posible, incluyendo aquellas con discapacidades
                visuales, auditivas, de movilidad y cognitivas.
              </p>
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Conformidad parcial con WCAG 2.1 nivel AA</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Accessible features */}
        <motion.section {...fadeIn} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="text-2xl font-heading font-bold text-white mb-6">
            Funciones de Accesibilidad
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={Keyboard}
              title="Navegacion por teclado"
              description="Toda la funcionalidad de la plataforma esta disponible a traves del teclado. Puedes navegar entre elementos interactivos con Tab, activar botones con Enter o Espacio, y cerrar dialogos con Escape."
              iconColor="text-blue-400"
              iconBg="bg-blue-500/15"
            />
            <FeatureCard
              icon={Eye}
              title="Soporte para lectores de pantalla"
              description="Utilizamos marcado semantico HTML5, roles ARIA y atributos aria-label para garantizar compatibilidad con lectores de pantalla como NVDA, JAWS y VoiceOver."
              iconColor="text-violet-400"
              iconBg="bg-violet-500/15"
            />
            <FeatureCard
              icon={Monitor}
              title="Soporte para movimiento reducido"
              description="Respetamos la configuracion 'prefers-reduced-motion' del sistema operativo. Cuando esta activada, las animaciones se desactivan o minimizan para una experiencia mas comoda."
              iconColor="text-cyan-400"
              iconBg="bg-cyan-500/15"
            />
            <FeatureCard
              icon={Sun}
              title="Soporte de alto contraste"
              description="Ofrecemos temas claro y oscuro con ratios de contraste que cumplen o superan los requisitos WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)."
              iconColor="text-amber-400"
              iconBg="bg-amber-500/15"
            />
            <FeatureCard
              icon={Focus}
              title="Indicadores de foco"
              description="Todos los elementos interactivos muestran indicadores de foco visibles y claros al navegar con el teclado, facilitando la orientacion dentro de la interfaz."
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/15"
            />
            <FeatureCard
              icon={Tags}
              title="Etiquetas ARIA"
              description="Utilizamos etiquetas ARIA descriptivas en botones de icono, imagenes, formularios y regiones de la pagina para proporcionar contexto adicional a las tecnologias de asistencia."
              iconColor="text-rose-400"
              iconBg="bg-rose-500/15"
            />
            <FeatureCard
              icon={SkipForward}
              title="Saltar al contenido"
              description="Un enlace 'Saltar al contenido principal' esta disponible al inicio de cada pagina, permitiendo a los usuarios de teclado acceder directamente al contenido sin recorrer la navegacion."
              iconColor="text-fuchsia-400"
              iconBg="bg-fuchsia-500/15"
            />
            <FeatureCard
              icon={Globe}
              title="Opciones de idioma"
              description="La plataforma esta disponible en espanol e ingles. El cambio de idioma es accesible por teclado y los cambios se anuncian a los lectores de pantalla mediante regiones ARIA en vivo."
              iconColor="text-teal-400"
              iconBg="bg-teal-500/15"
            />
          </div>
        </motion.section>

        {/* Known limitations */}
        <motion.section
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl border border-amber-500/20 p-8 mb-10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white mb-3">
                Limitaciones Conocidas
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                A pesar de nuestros esfuerzos, algunas partes de la plataforma pueden no ser
                completamente accesibles. Las siguientes son limitaciones conocidas:
              </p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-300">Mapas interactivos:</strong> Los componentes
                    de mapa basados en Mapbox GL tienen accesibilidad limitada para usuarios de
                    teclado y lectores de pantalla. Proporcionamos descripciones textuales
                    alternativas cuando es posible.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-300">Conversaciones de voz en tiempo real:</strong> La
                    funcion de chat de voz con personajes IA requiere capacidad auditiva y
                    verbal. Estamos trabajando en alternativas basadas en texto.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-300">Animaciones complejas:</strong> Algunas
                    transiciones y animaciones pueden no respetar completamente la preferencia
                    de movimiento reducido en todos los navegadores.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-300">Contenido generado por IA:</strong> Las
                    respuestas de personajes IA pueden no siempre seguir las mejores practicas
                    de lenguaje sencillo.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="glass rounded-3xl border border-white/10 p-8 mb-10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white mb-3">
                Contacto para Problemas de Accesibilidad
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Si encuentras barreras de accesibilidad en QuestMaster o tienes sugerencias
                para mejorar la accesibilidad de nuestra plataforma, nos encantaria saber
                de ti. Por favor, contactanos:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail size={14} className="text-blue-400" />
                  <a href="mailto:accesibilidad@questmaster.app" className="hover:text-blue-400 transition-colors underline underline-offset-2">
                    accesibilidad@questmaster.app
                  </a>
                </div>
                <p className="text-slate-500 text-xs mt-3">
                  Nos comprometemos a responder a los informes de accesibilidad dentro de 5 dias
                  laborables y a trabajar para resolver los problemas reportados lo antes posible.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Third-party content notice */}
        <motion.section
          {...fadeIn}
          transition={{ delay: 0.5 }}
          className="glass rounded-3xl border border-white/10 p-8 mb-10"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-500/15 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white mb-3">
                Contenido de Terceros
              </h2>
              <p className="text-slate-400 leading-relaxed">
                QuestMaster integra servicios de terceros como Mapbox para mapas, OpenAI para
                conversaciones de voz con IA, y AWS para infraestructura. Aunque hacemos todo
                lo posible por garantizar que estos componentes sean accesibles, no podemos
                garantizar la plena accesibilidad del contenido proporcionado por terceros.
                Si encuentras problemas de accesibilidad relacionados con estos servicios,
                te animamos a que nos lo comuniques para que podamos trabajar con nuestros
                proveedores para mejorar la experiencia.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Audit date */}
        <motion.section {...fadeIn} transition={{ delay: 0.6 }} className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} />
            <span>Ultima auditoria de accesibilidad: 1 de marzo de 2026</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Esta declaracion se revisa y actualiza trimestralmente.
          </p>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terminos</Link>
          <Link href="/about" className="hover:text-white transition-colors">Sobre nosotros</Link>
          <span>&copy; 2026 QuestMaster. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
