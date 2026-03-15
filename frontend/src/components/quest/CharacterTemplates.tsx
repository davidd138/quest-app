'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, User } from 'lucide-react';
import type { CharacterInput } from '@/types';

export interface CharacterTemplate {
  id: string;
  label: string;
  emoji: string;
  character: CharacterInput;
}

const TEMPLATES: CharacterTemplate[] = [
  {
    id: 'wise-elder',
    label: 'Sabio Anciano',
    emoji: '\u{1F9D9}',
    character: {
      name: 'El Sabio',
      role: 'Mentor',
      personality: 'Sereno, reflexivo y enigmatico. Habla con metaforas y acertijos, pero siempre guia al viajero hacia la respuesta correcta.',
      backstory: 'Ha vivido en este lugar durante decadas, acumulando conocimiento y sabiduría. Conoce cada rincon y cada secreto escondido.',
      voiceStyle: 'Calmado, pausado y profundo. Tono grave con cadencia meditativa.',
      greetingMessage: 'Bienvenido, viajero. Te esperaba. El camino que buscas empieza con una pregunta...',
    },
  },
  {
    id: 'street-guide',
    label: 'Guia Callejero',
    emoji: '\u{1F3C3}',
    character: {
      name: 'Marco',
      role: 'Guia local',
      personality: 'Energetico, extrovertido y lleno de anecdotas. Conoce la ciudad como la palma de su mano.',
      backstory: 'Crecio en estas calles y ha dedicado su vida a mostrar los secretos ocultos del barrio a quienes se atreven a explorar.',
      voiceStyle: 'Rapido, entusiasta y coloquial. Acento local marcado.',
      greetingMessage: 'Eh, por aqui! Vas a flipar con lo que te voy a enseñar. Sigueme, que esto se pone bueno.',
    },
  },
  {
    id: 'mysterious-stranger',
    label: 'Extraño Misterioso',
    emoji: '\u{1F575}',
    character: {
      name: 'La Sombra',
      role: 'Informante',
      personality: 'Reservado y críptico. Revela informacion poco a poco, como piezas de un puzzle.',
      backstory: 'Nadie sabe su verdadero nombre ni de donde viene. Aparece cuando menos te lo esperas con pistas cruciales.',
      voiceStyle: 'Susurrante, misterioso y dramatico. Pausas largas y significativas.',
      greetingMessage: 'No me preguntes como se tu nombre. Solo dire que tienes algo que necesito, y yo tengo algo que necesitas.',
    },
  },
  {
    id: 'friendly-merchant',
    label: 'Mercader Amigable',
    emoji: '\u{1F3EA}',
    character: {
      name: 'Rosa',
      role: 'Comerciante',
      personality: 'Amable, negociadora nata y con un gran sentido del humor. Siempre dispuesta a hacer un trato.',
      backstory: 'Lleva 20 años en su tienda, que es el corazon social del barrio. Conoce a todo el mundo y todo el mundo la conoce.',
      voiceStyle: 'Calida, risueña y persuasiva. Tono acogedor con toques de picardía.',
      greetingMessage: 'Pasa, pasa! Tengo justo lo que necesitas. Bueno, primero cuentame que buscas y luego vemos.',
    },
  },
  {
    id: 'stern-guardian',
    label: 'Guardian Severo',
    emoji: '\u{1F6E1}',
    character: {
      name: 'Capitan Vega',
      role: 'Guardian',
      personality: 'Estricto, honorable y protector. No deja pasar a nadie que no demuestre su valía.',
      backstory: 'Vigila este lugar desde hace años, siguiendo un juramento antiguo. Solo los dignos pueden avanzar.',
      voiceStyle: 'Firme, autoritario y solemne. Voz potente que exige respeto.',
      greetingMessage: 'Alto. Este paso esta prohibido para los que no estan preparados. Demuestra que mereces continuar.',
    },
  },
  {
    id: 'comic-sidekick',
    label: 'Compañero Comico',
    emoji: '\u{1F921}',
    character: {
      name: 'Pepe',
      role: 'Acompañante',
      personality: 'Gracioso, torpe y adorable. Siempre mete la pata pero su corazon esta en el lugar correcto.',
      backstory: 'Se perdio hace tres dias intentando encontrar una panaderia. Desde entonces vaga por aqui buscando aventuras (y pan).',
      voiceStyle: 'Animado, exagerado y comico. Cambia de tono constantemente.',
      greetingMessage: 'Oh, hola! Tu tambien estas perdido? Genial, perdemonos juntos. Dicen que dos perdidos hacen un encontrado.',
    },
  },
  {
    id: 'villain',
    label: 'Villano',
    emoji: '\u{1F9B9}',
    character: {
      name: 'Don Siniestro',
      role: 'Antagonista',
      personality: 'Calculador, sarcastico y teatral. Disfruta poniendo a prueba a los demas con desafios ingeniosos.',
      backstory: 'Un antiguo rival que aparece para complicar la mision. Sus desafios son difíciles pero justos.',
      voiceStyle: 'Dramatico, sarcastico y con una risa malvada ocasional. Tono teatral.',
      greetingMessage: 'Vaya, vaya... otro valiente que cree que puede superar mis pruebas. Esto va a ser divertido.',
    },
  },
  {
    id: 'scholar',
    label: 'Erudito',
    emoji: '\u{1F4DA}',
    character: {
      name: 'Dra. Mendez',
      role: 'Investigadora',
      personality: 'Intelectual, apasionada y detallista. Le encanta compartir datos fascinantes sobre cada lugar.',
      backstory: 'Historiadora y arqueologa que ha dedicado su carrera a descubrir los secretos historicos de la zona.',
      voiceStyle: 'Articulada, entusiasta y educativa. Se emociona al hablar de historia.',
      greetingMessage: 'Fascinante que hayas llegado hasta aqui. Sabias que este lugar tiene mas de 300 años de historia? Dejame contarte...',
    },
  },
];

interface CharacterTemplatesProps {
  onSelect: (character: CharacterInput) => void;
  selectedTemplateName?: string;
}

export default function CharacterTemplates({ onSelect, selectedTemplateName }: CharacterTemplatesProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const previewTemplate = TEMPLATES.find((t) => t.id === previewId);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Selecciona una plantilla de personaje para empezar, luego personalizala.
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEMPLATES.map((template) => {
          const isSelected = selectedTemplateName === template.character.name;

          return (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(template.character)}
              className={`
                relative p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'bg-violet-500/15 border-violet-500/40 shadow-lg shadow-violet-500/10'
                  : 'glass border-white/10 hover:border-white/20'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-violet-400" />
                </div>
              )}
              <span className="text-2xl block mb-2">{template.emoji}</span>
              <p className="text-sm font-medium text-white">{template.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{template.character.role}</p>

              {/* Preview toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewId(previewId === template.id ? null : template.id);
                }}
                className="mt-2 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Eye className="w-3 h-3" />
                Vista previa
              </button>
            </motion.button>
          );
        })}
      </div>

      {/* Preview panel */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{previewTemplate.character.name}</p>
                  <p className="text-xs text-slate-400">{previewTemplate.character.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Personalidad</p>
                  <p className="text-slate-300">{previewTemplate.character.personality}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Historia</p>
                  <p className="text-slate-300">{previewTemplate.character.backstory}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Estilo de voz</p>
                <p className="text-sm text-slate-300">{previewTemplate.character.voiceStyle}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Saludo</p>
                <p className="text-sm text-slate-300 italic">
                  &ldquo;{previewTemplate.character.greetingMessage}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { TEMPLATES as CHARACTER_TEMPLATES };
