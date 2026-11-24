import type React from 'react';
import {
  Airplane,
  Apple,
  Archery,
  Bed,
  Bicycle,
  Book,
  Brain,
  Camera,
  Car,
  Church,
  CigaretteSlash,
  Code,
  CoffeeCup,
  Coins,
  Droplet,
  Flower,
  Gamepad,
  GraduationCap,
  Group,
  Gym,
  HalfMoon,
  Headset,
  Heart,
  Home,
  Journal,
  Language,
  Laptop,
  Leaf,
  MusicDoubleNote,
  Palette,
  PharmacyCrossCircle,
  Phone,
  Running,
  ShoppingBag,
  Soap,
  Sparks,
  Star,
  SunLight,
  Timer,
  Trophy,
  VideoCamera,
  Walking,
  Wallet,
  Yoga,
} from 'iconoir-react';

export interface HabitIconOption {
  /** Canonical component name in iconoir-react (safe to persist directly in DB) */
  key: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  keywords: string[];
}

export const HABIT_ICONS: HabitIconOption[] = [
  {
    key: 'Droplet',
    label: 'Água',
    icon: Droplet,
    keywords: [
      'agua', 'beber', 'hidratar', 'hidratacao', 'copo', 'copos',
      'litro', 'litros', '2l', '3l', 'garrafa', 'liquido', 'water',
    ],
  },
  {
    key: 'Gym',
    label: 'Treino',
    icon: Gym,
    keywords: [
      'treino', 'treinar', 'academia', 'musculacao', 'peso', 'pesos',
      'crossfit', 'exercicio', 'exercicios', 'malhar', 'flexao', 'flexoes',
      'abdominal', 'abdominais', 'pilates', 'calistenia', 'forca', 'gym', 'workout',
    ],
  },
  {
    key: 'Running',
    label: 'Corrida',
    icon: Running,
    keywords: [
      'correr', 'corrida', 'cardio', 'esteira', 'maratona',
      '5km', '10km', 'km', 'jogging', 'trote', 'run', 'running',
    ],
  },
  {
    key: 'Walking',
    label: 'Caminhada',
    icon: Walking,
    keywords: ['caminhar', 'caminhada', 'andar', 'passos', 'passear', '10k', 'walk', 'trilha'],
  },
  {
    key: 'Bicycle',
    label: 'Ciclismo',
    icon: Bicycle,
    keywords: ['bike', 'bicicleta', 'pedalar', 'ciclismo', 'spinning', 'ciclo'],
  },
  {
    key: 'Yoga',
    label: 'Yoga',
    icon: Yoga,
    keywords: [
      'yoga', 'ioga', 'alongar', 'alongamento', 'mobilidade',
      'postura', 'respiracao', 'respirar', 'relaxar',
    ],
  },
  {
    key: 'Book',
    label: 'Leitura',
    icon: Book,
    keywords: [
      'ler', 'leitura', 'livro', 'livros', 'pagina', 'paginas',
      'capitulo', 'artigo', 'read', 'book', 'biblia',
    ],
  },
  {
    key: 'GraduationCap',
    label: 'Estudos',
    icon: GraduationCap,
    keywords: [
      'estudar', 'estudo', 'estudos', 'curso', 'aula', 'aulas',
      'faculdade', 'prova', 'vestibular', 'concurso', 'pos', 'study',
    ],
  },
  {
    key: 'Language',
    label: 'Idioma',
    icon: Language,
    keywords: [
      'ingles', 'espanhol', 'frances', 'alemao', 'italiano', 'japones',
      'coreano', 'idioma', 'idiomas', 'lingua', 'duolingo', 'vocabulario',
      'anki', 'fluencia', 'english',
    ],
  },
  {
    key: 'Brain',
    label: 'Mente',
    icon: Brain,
    keywords: [
      'meditar', 'meditacao', 'mindfulness', 'mente', 'terapia',
      'psicologo', 'concentracao', 'silencio', 'meditate',
    ],
  },
  {
    key: 'Journal',
    label: 'Diário',
    icon: Journal,
    keywords: [
      'diario', 'escrever', 'escrita', 'gratidao', 'reflexao',
      'journal', 'journaling', 'anotar', 'planejar', 'planejamento',
      'revisar', 'revisao', 'lista',
    ],
  },
  {
    key: 'HalfMoon',
    label: 'Sono',
    icon: HalfMoon,
    keywords: [
      'dormir', 'sono', 'noite', 'noturna', 'sem tela', 'sem telas',
      'desligar', '8h', 'sleep', 'cochilo',
    ],
  },
  {
    key: 'Bed',
    label: 'Descanso',
    icon: Bed,
    keywords: ['cama', 'arrumar cama', 'descansar', 'deitar', 'soneca', 'repouso'],
  },
  {
    key: 'SunLight',
    label: 'Manhã',
    icon: SunLight,
    keywords: ['sol', 'manha', 'acordar', 'matinal', 'despertar', 'cedo', 'vitamina d', 'morning'],
  },
  {
    key: 'Apple',
    label: 'Alimentação',
    icon: Apple,
    keywords: [
      'comer', 'comida', 'dieta', 'fruta', 'frutas', 'legume', 'legumes',
      'verdura', 'salada', 'proteina', 'saudavel', 'nutricao', 'jejum',
      'acucar', 'doce', 'doces', 'refrigerante', 'refeicao', 'cozinhar',
      'marmita', 'almoco', 'jantar', 'vegetais', 'alcool', 'zero alcool',
    ],
  },
  {
    key: 'CoffeeCup',
    label: 'Café / Chá',
    icon: CoffeeCup,
    keywords: ['cafe', 'cha', 'cafeina', 'espresso', 'mate', 'matcha', 'coffee', 'tea'],
  },
  {
    key: 'PharmacyCrossCircle',
    label: 'Suplementos',
    icon: PharmacyCrossCircle,
    keywords: [
      'remedio', 'remedios', 'vitamina', 'vitaminas', 'creatina', 'whey',
      'suplemento', 'suplementos', 'medicamento', 'pilula', 'colirio', 'tomar',
    ],
  },
  {
    key: 'Soap',
    label: 'Skincare',
    icon: Soap,
    keywords: [
      'skincare', 'pele', 'protetor', 'protetor solar', 'rosto', 'banho',
      'escovar', 'dente', 'dentes', 'fio dental', 'higiene', 'hidratante',
    ],
  },
  {
    key: 'CigaretteSlash',
    label: 'Sem vícios',
    icon: CigaretteSlash,
    keywords: ['fumar', 'cigarro', 'vape', 'vicio', 'parar', 'abstinencia', 'sem fumar'],
  },
  {
    key: 'Heart',
    label: 'Saúde',
    icon: Heart,
    keywords: ['saude', 'bem-estar', 'coracao', 'autocuidado', 'pausa', 'amor'],
  },
  {
    key: 'Wallet',
    label: 'Finanças',
    icon: Wallet,
    keywords: [
      'dinheiro', 'financas', 'financeiro', 'gasto', 'gastos',
      'orcamento', 'planilha', 'fatura', 'cartao', 'money',
    ],
  },
  {
    key: 'Coins',
    label: 'Investir',
    icon: Coins,
    keywords: ['economizar', 'poupar', 'investir', 'investimento', 'guardar', 'aporte', 'reserva'],
  },
  {
    key: 'Code',
    label: 'Código',
    icon: Code,
    keywords: [
      'programar', 'programacao', 'codigo', 'code', 'dev', 'github',
      'commit', 'algoritmo', 'leetcode', 'software', 'python', 'react', 'typescript',
    ],
  },
  {
    key: 'Laptop',
    label: 'Trabalho',
    icon: Laptop,
    keywords: ['trabalho', 'trabalhar', 'projeto', 'projetos', 'inbox', 'email', 'emails', 'freela', 'site', 'app'],
  },
  {
    key: 'Timer',
    label: 'Foco',
    icon: Timer,
    keywords: [
      'pomodoro', 'foco', 'deep work', 'tempo', 'produtividade',
      'sem celular', 'celular', 'detox', 'redes sociais', 'instagram', 'tiktok',
    ],
  },
  {
    key: 'Archery',
    label: 'Metas',
    icon: Archery,
    keywords: ['meta', 'metas', 'objetivo', 'objetivos', 'alvo', 'prioridade'],
  },
  {
    key: 'Trophy',
    label: 'Desafio',
    icon: Trophy,
    keywords: ['desafio', 'conquista', 'vitoria', 'campeonato', 'competicao', 'recorde'],
  },
  {
    key: 'MusicDoubleNote',
    label: 'Música',
    icon: MusicDoubleNote,
    keywords: [
      'musica', 'violao', 'guitarra', 'piano', 'teclado',
      'bateria', 'cantar', 'canto', 'tocar', 'instrumento',
    ],
  },
  {
    key: 'Headset',
    label: 'Podcast',
    icon: Headset,
    keywords: ['podcast', 'ouvir', 'audiobook', 'audio', 'palestra'],
  },
  {
    key: 'Palette',
    label: 'Arte',
    icon: Palette,
    keywords: ['desenhar', 'desenho', 'pintar', 'pintura', 'arte', 'design', 'criar', 'criatividade'],
  },
  {
    key: 'Camera',
    label: 'Fotografia',
    icon: Camera,
    keywords: ['foto', 'fotos', 'fotografia', 'camera', 'fotografar'],
  },
  {
    key: 'VideoCamera',
    label: 'Conteúdo',
    icon: VideoCamera,
    keywords: ['conteudo', 'postar', 'post', 'video', 'gravar', 'editar', 'reels', 'youtube'],
  },
  {
    key: 'Gamepad',
    label: 'Lazer',
    icon: Gamepad,
    keywords: ['jogar', 'jogo', 'game', 'xadrez', 'lazer', 'hobby', 'diversao'],
  },
  {
    key: 'Home',
    label: 'Casa',
    icon: Home,
    keywords: [
      'casa', 'arrumar', 'limpar', 'limpeza', 'organizar', 'organizacao',
      'louca', 'quarto', 'mesa', 'minimalismo', 'roupa', 'lavar', 'faxina',
    ],
  },
  {
    key: 'Group',
    label: 'Social',
    icon: Group,
    keywords: [
      'familia', 'amigos', 'amigo', 'conversar', 'pais', 'mae', 'pai',
      'filho', 'filhos', 'namorada', 'namorado', 'esposa', 'marido', 'networking', 'social',
    ],
  },
  {
    key: 'Phone',
    label: 'Contato',
    icon: Phone,
    keywords: ['ligar', 'ligacao', 'mensagem', 'responder', 'whatsapp', 'contato'],
  },
  {
    key: 'Leaf',
    label: 'Natureza',
    icon: Leaf,
    keywords: ['planta', 'plantas', 'regar', 'natureza', 'jardim', 'horta', 'ar livre', 'parque', 'cachorro', 'gato', 'pet'],
  },
  {
    key: 'Flower',
    label: 'Bem-estar',
    icon: Flower,
    keywords: ['flor', 'flores', 'calma', 'leveza', 'paz', 'spa'],
  },
  {
    key: 'Church',
    label: 'Espiritual',
    icon: Church,
    keywords: ['oracao', 'orar', 'rezar', 'devocional', 'igreja', 'missa', 'culto', 'fe', 'espiritual'],
  },
  {
    key: 'Airplane',
    label: 'Viagem',
    icon: Airplane,
    keywords: ['viagem', 'viajar', 'intercambio', 'voo', 'passaporte', 'turismo'],
  },
  {
    key: 'Car',
    label: 'Direção',
    icon: Car,
    keywords: ['carro', 'dirigir', 'transito', 'moto', 'autoescola'],
  },
  {
    key: 'ShoppingBag',
    label: 'Compras',
    icon: ShoppingBag,
    keywords: ['mercado', 'compras', 'supermercado', 'feira', 'comprar'],
  },
  {
    key: 'Star',
    label: 'Destaque',
    icon: Star,
    keywords: ['especial', 'estrela', 'favorito', 'rotina', 'habito'],
  },
  {
    key: 'Sparks',
    label: 'Geral',
    icon: Sparks,
    keywords: [],
  },
];

/** Backwards-compatibility aliases for previously saved habit icon keys */
const LEGACY_ICON_ALIASES: Record<string, string> = {
  BookOpen: 'Book',
  Dumbbell: 'Gym',
  Languages: 'Language',
  Sparkles: 'Sparks',
};

export const HABIT_ICON_MAP: Record<string, React.FC<{ className?: string }>> = Object.fromEntries(
  HABIT_ICONS.map((item) => [item.key, item.icon])
);

export function normalizeHabitIconKey(key: string): string {
  return LEGACY_ICON_ALIASES[key] || key;
}

export function resolveHabitIcon(key: string): React.FC<{ className?: string }> {
  const canonical = normalizeHabitIconKey(key);
  return HABIT_ICON_MAP[canonical] || Sparks;
}

export function getHabitIconOption(key: string): HabitIconOption {
  const canonical = normalizeHabitIconKey(key);
  return HABIT_ICONS.find((item) => item.key === canonical) || HABIT_ICONS[HABIT_ICONS.length - 1];
}

function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches a habit name to the most relevant canonical iconoir-react icon.
 * Returns { key, matched } where key is the exact iconoir-react export name.
 */
export function suggestHabitIcon(habitName: string): { key: string; matched: boolean } {
  const normalized = normalizeText(habitName);
  if (!normalized) return { key: 'Sparks', matched: false };

  const words = normalized.split(' ').filter(Boolean);
  let bestKey = 'Sparks';
  let bestScore = 0;

  for (const item of HABIT_ICONS) {
    if (item.keywords.length === 0) continue;
    let score = 0;

    for (const kw of item.keywords) {
      if (kw.includes(' ')) {
        if (normalized.includes(kw)) {
          score = Math.max(score, 12 + kw.length * 0.1);
        }
      } else {
        for (const w of words) {
          if (w === kw) {
            score = Math.max(score, 10 + kw.length * 0.1);
          } else if (w.length >= 3 && kw.startsWith(w)) {
            score = Math.max(score, 6 + w.length * 0.1);
          } else if (kw.length >= 4 && w.startsWith(kw)) {
            score = Math.max(score, 7 + kw.length * 0.1);
          } else if (kw.length >= 5 && w.includes(kw)) {
            score = Math.max(score, 5);
          }
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestKey = item.key;
    }
  }

  return { key: bestKey, matched: bestScore > 0 };
}

/** Filters HABIT_ICONS by label, keywords, or canonical Iconoir export name */
export function searchHabitIcons(query: string): HabitIconOption[] {
  const q = normalizeText(query);
  if (!q) return HABIT_ICONS;
  return HABIT_ICONS.filter((item) => {
    if (normalizeText(item.label).includes(q)) return true;
    if (item.key.toLowerCase().includes(q)) return true;
    return item.keywords.some((kw) => kw.includes(q));
  });
}
