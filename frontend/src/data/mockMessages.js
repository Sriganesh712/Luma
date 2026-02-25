export const mockMessages = [
  {
    id: '1',
    role: 'user',
    content: 'Hi Sahayak! Can you help me understand quantum mechanics?',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Of course! Quantum mechanics is fascinating. Let\'s start with the basics. At the quantum level, particles behave very differently from what we observe in the everyday world.\n\nKey concepts to understand:\n• Wave-particle duality\n• Quantization of energy\n• Uncertainty principle\n• Superposition\n\nWhich of these would you like to explore first?',
    timestamp: new Date(Date.now() - 4 * 60000),
  },
  {
    id: '3',
    role: 'user',
    content: 'Tell me more about the uncertainty principle',
    timestamp: new Date(Date.now() - 3 * 60000),
  },
  {
    id: '4',
    role: 'assistant',
    content: 'The Uncertainty Principle, formulated by Werner Heisenberg in 1927, states that you cannot simultaneously know both the exact position and exact momentum of a particle with perfect precision.\n\nMathematically: Δx · Δp ≥ ℏ/2\n\nWhere:\n• Δx = uncertainty in position\n• Δp = uncertainty in momentum\n• ℏ = reduced Planck\'s constant\n\nThis isn\'t about measurement limitations—it\'s a fundamental property of nature. The more precisely you measure position, the less precisely you can know momentum, and vice versa.',
    timestamp: new Date(Date.now() - 2 * 60000),
  },
  {
    id: '5',
    role: 'user',
    content: 'What are some real-world applications of this principle?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '6',
    role: 'assistant',
    content: 'Great question! The Uncertainty Principle isn\'t just theoretical—it has profound practical implications:\n\n1. **Semiconductor Technology**: The behavior of electrons in transistors is governed by quantum uncertainty\n\n2. **Atomic Clocks**: These rely on precise energy level transitions in atoms\n\n3. **Tunnel Microscopy**: Uses quantum tunneling to visualize atomic structures\n\n4. **Laser Technology**: The coherence and precision of lasers depend on quantum principles\n\n5. **Nuclear Reactors**: Understanding nuclear decay rates relies on quantum mechanics\n\n6. **Medical Imaging**: MRI machines use nuclear magnetic resonance, a quantum effect\n\nThese technologies are worth billions of dollars in modern society!\n\nWould you like to dive deeper into any of these applications?',
    timestamp: new Date(Date.now() - 30000),
  },
];

export const navigationItems = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'sessions', label: 'Study Sessions', icon: 'BookOpen' },
  { id: 'progress', label: 'Progress', icon: 'BarChart3' },
  { id: 'focus', label: 'Focus Mode', icon: 'Focus' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];
