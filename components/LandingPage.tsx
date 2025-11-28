/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';

// Interface para as propriedades recebidas pelo componente
interface LandingPageProps {
  onStart: (aiEnabled: boolean) => void; // Função chamada quando o usuário clica em "Acessar Cidade"
}

/**
 * Componente da Página Inicial (Landing Page)
 * Responsável por apresentar o projeto, a equipe e os conceitos antes do jogo iniciar.
 */
const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  // Estado para controlar se a IA (Gemini) está ativa ou não
  const [iaAtivada, setIaAtivada] = useState(true);

  // Função para rolar suavemente até a seção desejada
  // Isso substitui o uso de <a href="#id"> que causava o erro de conexão
  const rolarParaSecao = (id: string) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-slate-900/90 text-white font-vt323 scroll-smooth">
      {/* Barra de Navegação Fixa */}
      <nav className="fixed top-0 w-full bg-slate-900/95 border-b border-cyan-900 z-50 backdrop-blur-sm px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="text-3xl text-cyan-400 tracking-wider font-bold drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
          GRIDLINE<span className="text-yellow-400">.OS</span>
        </div>
        
        {/* Links de Navegação (Usando onClick para evitar recarregamento da página) */}
        <div className="hidden md:flex gap-8 text-xl text-slate-300 cursor-pointer">
          <button onClick={() => rolarParaSecao('sobre')} className="hover:text-cyan-300 transition-colors bg-transparent border-none">Sobre</button>
          <button onClick={() => rolarParaSecao('features')} className="hover:text-cyan-300 transition-colors bg-transparent border-none">Funcionalidades</button>
          <button onClick={() => rolarParaSecao('cookie')} className="hover:text-yellow-300 transition-colors bg-transparent border-none">Cookies</button>
          <button onClick={() => rolarParaSecao('team')} className="hover:text-cyan-300 transition-colors bg-transparent border-none">Equipe</button>
        </div>

        <button 
          onClick={() => onStart(iaAtivada)}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-4 py-1 rounded shadow border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all text-xl"
        >
          ACESSAR CIDADE
        </button>
      </nav>

      {/* Seção Hero (Cabeçalho Principal) */}
      <header className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center pt-20">
        {/* Fundo gradiente transparente para permitir ver o mapa 3D atrás */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl animate-fade-in-up">
            <h1 className="text-7xl md:text-9xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] filter">
            GRIDLINE
            </h1>
            <p className="text-2xl md:text-3xl text-yellow-300 mb-8 uppercase tracking-widest bg-slate-900/60 inline-block px-4 py-2 rounded backdrop-blur-md border border-slate-700">
            A Cidade Inteligente Litorânea
            </p>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md bg-black/30 p-4 rounded-xl">
            Uma simulação interativa focada em tecnologia, sustentabilidade e qualidade de vida. 
            Construa, gerencie e viva o futuro.
            </p>

            <div className="bg-slate-800/80 p-6 rounded-xl border-2 border-cyan-500/50 inline-block backdrop-blur-md shadow-2xl">
                {/* Checkbox para Ativar IA */}
                <div className="mb-6 flex items-center justify-center gap-4">
                    <label className="flex items-center cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={iaAtivada}
                                onChange={(e) => setIaAtivada(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-slate-700 rounded-full border border-slate-500 peer-checked:bg-cyan-600 transition-colors"></div>
                            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${iaAtivada ? 'translate-x-7' : ''}`}></div>
                        </div>
                        <span className="ml-3 text-xl group-hover:text-cyan-300 transition-colors">Ativar Assistente IA (Gemini)</span>
                    </label>
                </div>

                <button 
                    onClick={() => onStart(iaAtivada)}
                    className="w-full md:w-auto px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-3xl rounded shadow-[0_0_20px_rgba(34,197,94,0.4)] border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                    CONECTAR AO SISTEMA
                </button>
            </div>
        </div>
        
        <div className="absolute bottom-10 animate-bounce text-slate-400 pointer-events-none">
            <p className="text-lg">Role para saber mais</p>
            <span className="text-3xl">↓</span>
        </div>
      </header>

      {/* Seção Sobre */}
      <section id="sobre" className="py-20 px-6 bg-slate-900 relative border-t-4 border-cyan-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <div className="bg-cyan-900/20 p-6 rounded-xl border-2 border-cyan-500/30">
                    <h2 className="text-5xl text-cyan-400 mb-6 border-b-2 border-cyan-800 pb-2">O Projeto</h2>
                    <p className="text-xl text-slate-300 leading-relaxed mb-4 text-justify">
                        <strong>Gridline</strong> é uma cidade determinada a aumentar a qualidade de vida dos seus habitantes por meio de serviços urbanos de qualidade. Ela usa de artifícios que auxiliam em uma gestão mais performática de todos os setores de infraestrutura urbana.
                    </p>
                    <p className="text-xl text-slate-300 leading-relaxed text-justify">
                        Utilizando sensores e complementando com ferramentas de coleta de dados, a cidade consegue atribuir melhorias nos cenários que mais necessitam de atenção, priorizando uma gestão eficaz das demandas de transporte e urbanização.
                    </p>
                </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
                 <div className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col items-center text-center hover:scale-105 transition-transform">
                     <span className="text-5xl mb-2">🚦</span>
                     <h3 className="text-2xl text-yellow-300">Tráfego Smart</h3>
                     <p className="text-slate-400">Iluminação e semáforos inteligentes.</p>
                 </div>
                 <div className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col items-center text-center hover:scale-105 transition-transform">
                     <span className="text-5xl mb-2">🆔</span>
                     <h3 className="text-2xl text-cyan-300">ID Digital</h3>
                     <p className="text-slate-400">Acesso único a serviços governamentais.</p>
                 </div>
                 <div className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col items-center text-center hover:scale-105 transition-transform">
                     <span className="text-5xl mb-2">⚡</span>
                     <h3 className="text-2xl text-green-300">Sustentável</h3>
                     <p className="text-slate-400">Energia limpa e gestão ambiental.</p>
                 </div>
                 <div className="bg-slate-800 p-4 rounded border border-slate-700 flex flex-col items-center text-center hover:scale-105 transition-transform">
                     <span className="text-5xl mb-2">🤖</span>
                     <h3 className="text-2xl text-purple-300">IA Integrada</h3>
                     <p className="text-slate-400">Análise de dados em tempo real.</p>
                 </div>
            </div>
        </div>
      </section>

      {/* Seção Funcionalidades (Requisitos) */}
      <section id="features" className="py-20 px-6 bg-slate-800 border-t-4 border-slate-700">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl text-center text-white mb-12">Requisitos do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* RF01/07 */}
                <div className="bg-slate-900 p-6 rounded-xl border-l-4 border-pink-500 shadow-xl">
                    <div className="text-6xl mb-4">👤</div>
                    <h3 className="text-3xl text-pink-400 mb-2">Avatar & Perfil</h3>
                    <p className="text-lg text-slate-400">
                        Crie sua identidade única. Personalize roupas, rosto e acessórios. RF01 & RF07.
                    </p>
                </div>
                {/* RF03/06 */}
                <div className="bg-slate-900 p-6 rounded-xl border-l-4 border-blue-500 shadow-xl">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-3xl text-blue-400 mb-2">Eventos & Comunidade</h3>
                    <p className="text-lg text-slate-400">
                        Participe de festas, interaja com moradores e cumpra missões da cidade. RF03 & RF06.
                    </p>
                </div>
                {/* RF05/02 */}
                <div className="bg-slate-900 p-6 rounded-xl border-l-4 border-yellow-500 shadow-xl">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-3xl text-yellow-400 mb-2">Economia & Trocas</h3>
                    <p className="text-lg text-slate-400">
                        Gerencie seus Cookies, compre propriedades, invista na bolsa e melhore a cidade. RF02 & RF05.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Seção Cookies */}
      <section id="cookie" className="py-20 px-6 bg-[#3b2d14] relative border-t-4 border-yellow-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fbbf24 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 relative z-10">
            <div className="md:w-1/3 flex justify-center">
                 <div className="w-64 h-64 bg-yellow-500 rounded-full border-8 border-yellow-700 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.5)] animate-pulse-slow">
                     <span className="text-9xl text-yellow-900 font-bold">C$</span>
                 </div>
            </div>
            <div className="md:w-2/3 text-left">
                <h2 className="text-6xl text-yellow-400 mb-6 drop-shadow-md">A Moeda: Cookie</h2>
                <p className="text-2xl text-yellow-100 mb-4 leading-relaxed">
                    "O Cookie é a moeda oficial que pulsa na Gridline."
                </p>
                <p className="text-xl text-yellow-200/80 leading-relaxed mb-6">
                    Essencial para a economia da cidade, ela permite que os cidadãos comprem, vendam e troquem bens e serviços no mercado digital. Cada Cookie que você ganha e gasta ajuda a fortalecer a comunidade.
                </p>
                <div className="bg-yellow-900/50 p-4 rounded border border-yellow-600/50 inline-block">
                    <p className="text-yellow-400 text-lg">💡 Inspirado nos "cookies" digitais: pacotes de dados que personalizam sua experiência.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Seção Equipe */}
      <section id="team" className="py-20 px-6 bg-slate-950 border-t-4 border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl text-slate-500 mb-12 uppercase tracking-[0.5em]">Gridlianos / Desenvolvedores (INF-11)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    {name: 'Pablo Gabriel', role: 'Dev'},
                    {name: 'Gabriel Damaceno', role: 'Dev'},
                    {name: 'Yuri Pereira', role: 'Dev'},
                    {name: 'Matheus Augusto', role: 'Dev'}
                ].map((member, i) => (
                    <div key={i} className="group">
                        <div className="w-32 h-32 mx-auto bg-slate-800 rounded-xl mb-4 border-2 border-slate-700 group-hover:border-cyan-400 group-hover:bg-slate-700 transition-all flex items-center justify-center text-4xl grayscale group-hover:grayscale-0">
                            👨‍💻
                        </div>
                        <h3 className="text-2xl text-white group-hover:text-cyan-300 transition-colors">{member.name}</h3>
                        <span className="text-slate-500 text-lg">{member.role}</span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-black py-8 text-center border-t border-slate-800">
        <p className="text-slate-600 text-lg">© 2024 Projeto Gridline. Todos os direitos reservados.</p>
        <div className="mt-2 text-slate-700 text-sm">
            HTML5 • CSS3 • React • Three.js • MySQL (Simulação)
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;