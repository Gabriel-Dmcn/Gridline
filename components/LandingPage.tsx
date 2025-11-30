
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const rolarParaSecao = (id: string) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-slate-900 font-vt323 scroll-smooth">
      {/* Barra de Navegação */}
      <nav className="fixed top-0 w-full bg-slate-900 border-b border-cyan-900 z-50 px-6 py-3 flex justify-between items-center shadow-lg">
        <div className="text-3xl text-cyan-400 tracking-wider font-bold">
          GRIDLINE<span className="text-yellow-400">.OS</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-xl text-slate-300">
          <button onClick={() => rolarParaSecao('sobre')} className="hover:text-cyan-300">Sobre</button>
          <button onClick={() => rolarParaSecao('features')} className="hover:text-cyan-300">Funcionalidades</button>
          <button onClick={() => rolarParaSecao('cookie')} className="hover:text-yellow-300">Cookies</button>
          <button onClick={() => rolarParaSecao('team')} className="hover:text-cyan-300">Equipe</button>
        </div>

        <button 
          onClick={onStart}
          className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-4 py-1 rounded shadow text-xl"
        >
          ACESSAR CIDADE
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center pt-24 bg-gradient-to-b from-slate-900 to-slate-800">
        
        <div className="relative z-10 max-w-4xl animate-fade-in-up">
            {/* Título sem gradiente complexo para garantir visibilidade */}
            <h1 className="text-8xl md:text-9xl mb-4 text-cyan-400 font-bold tracking-widest drop-shadow-[4px_4px_0_#000]">
              GRIDLINE
            </h1>
            
            <p className="text-2xl md:text-3xl text-yellow-300 mb-8 uppercase tracking-widest bg-black/40 inline-block px-4 py-2 rounded border border-slate-600">
              A Cidade Inteligente Litorânea
            </p>
            
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed bg-slate-800/80 p-4 rounded-xl border border-slate-600 shadow-xl">
              Uma simulação interativa focada em tecnologia, sustentabilidade e qualidade de vida. 
              Construa, gerencie e viva o futuro.
            </p>

            <button 
                onClick={onStart}
                className="px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-3xl rounded shadow-[0_0_20px_rgba(34,197,94,0.4)] border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
            >
                CONECTAR AO SISTEMA
            </button>
        </div>
        
        <div className="absolute bottom-10 animate-bounce text-slate-400">
            <p className="text-lg">Role para saber mais</p>
            <span className="text-3xl">↓</span>
        </div>
      </header>

      {/* Sobre */}
      <section id="sobre" className="py-20 px-6 bg-slate-900 border-t-4 border-cyan-900">
        <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
            <h2 className="text-5xl text-cyan-400 mb-6 border-b-2 border-cyan-800 pb-2">O Projeto</h2>
            <p className="text-xl text-slate-300 leading-relaxed text-justify">
                <strong>Gridline</strong> é uma cidade determinada a aumentar a qualidade de vida dos seus habitantes por meio de serviços urbanos de qualidade. Ela usa de artifícios que auxiliam em uma gestão mais performática de todos os setores de infraestrutura urbana. Utilizando sensores e complementando com ferramentas de coleta de dados, a cidade consegue atribuir melhorias nos cenários que mais necessitam de atenção.
            </p>
        </div>
      </section>
      
      {/* Funcionalidades */}
      <section id="features" className="py-20 px-6 bg-slate-800">
         <div className="max-w-6xl mx-auto">
             <h2 className="text-5xl text-purple-400 mb-12 text-center">Funcionalidades</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-slate-900 p-6 rounded-lg border-2 border-slate-700 hover:border-purple-500 transition-colors">
                     <div className="text-5xl mb-4">🤖</div>
                     <h3 className="text-2xl text-white mb-2">Avatar Customizável</h3>
                     <p className="text-slate-400">Crie sua identidade digital e explore o mapa em tempo real.</p>
                 </div>
                 <div className="bg-slate-900 p-6 rounded-lg border-2 border-slate-700 hover:border-purple-500 transition-colors">
                     <div className="text-5xl mb-4">📈</div>
                     <h3 className="text-2xl text-white mb-2">Economia Dinâmica</h3>
                     <p className="text-slate-400">Invista na bolsa, gerencie recursos e equilibre o orçamento.</p>
                 </div>
                 <div className="bg-slate-900 p-6 rounded-lg border-2 border-slate-700 hover:border-purple-500 transition-colors">
                     <div className="text-5xl mb-4">⚡</div>
                     <h3 className="text-2xl text-white mb-2">Sustentabilidade</h3>
                     <p className="text-slate-400">Gerencie energia limpa e reduza o impacto ambiental.</p>
                 </div>
             </div>
         </div>
      </section>

      {/* Cookies */}
      <section id="cookie" className="py-20 px-6 bg-slate-900 border-t border-slate-700">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-10">
              <div className="md:w-1/3 text-9xl text-center animate-spin-slow sticky top-24">🍪</div>
              <div className="md:w-2/3">
                  <h2 className="text-5xl text-yellow-400 mb-6">Moeda Cookie</h2>
                  
                  <p className="text-xl text-slate-300 leading-relaxed mb-4">
                    No começo da Gridline era um projeto ambicioso, foi criada a primeira e única moeda da cidade: <strong>O Cookie</strong>.
                  </p>

                  <p className="text-lg text-slate-400 leading-relaxed mb-4 text-justify">
                    O Cookie é a moeda oficial que pulsa na Gridline. Essencial para a economia da cidade, ela permite que os cidadãos comprem, vendem e trocam bens e serviços no mercado digital. Cada Cookie que você ganha e gasta, ajuda a fortalecer a comunidade, tornando Gridline um lugar mais dinâmico.
                  </p>

                  <p className="text-lg text-slate-400 leading-relaxed mb-4 text-justify">
                    O nome foi inspirado nos "cookies" digitais, pequenos pacotes de dados que personalizam a experiência online. Os primeiros Cookies da história foram emitidos como recompensa aos cidadãos pioneiros por suas contribuições e conquistas como: participar de votação de urbanismo, testar sistemas digitais e ajudar a construir a cultura da nova metrópole.
                  </p>
                  
                  <p className="text-lg text-slate-400 leading-relaxed text-justify">
                    Esse sistema rapidamente se tornou a base de toda economia. Desde pagar por um serviço de transporte até comprar algo no mercado digital, o Cookie se tornou o pulso financeiro de Gridline.
                  </p>
              </div>
          </div>
      </section>

      {/* Equipe */}
      <section id="team" className="py-20 px-6 bg-slate-800">
          <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl text-green-400 mb-10">Gridlianos (Equipe)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {['Pablo Gabriel', 'Gabriel Damaceno', 'Matheus Augusto'].map(member => (
                      <div key={member} className="bg-slate-900 p-6 rounded-xl border border-slate-600 flex flex-col items-center hover:border-green-500 transition-all hover:-translate-y-2 shadow-lg">
                          {/* Container da Imagem */}
                          <div className="w-32 h-32 bg-slate-700 rounded-full mb-4 overflow-hidden border-4 border-slate-500 shadow-lg relative group">
                              <img 
                                src={`/${member}.jpg`} 
                                alt={member} 
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    // Fallback caso a imagem não carregue
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                    target.parentElement!.innerHTML = '<span class="text-5xl">👨‍💻</span>';
                                }}
                              />
                          </div>
                          <h3 className="text-2xl text-white font-bold">{member}</h3>
                          <p className="text-green-400 text-sm tracking-widest font-mono mt-1 uppercase">Desenvolvedor</p>
                          <p className="text-slate-500 text-xs mt-2">INF-11</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      <footer className="py-6 text-center text-slate-600 bg-black">
          &copy; 2024 Gridline Project. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default LandingPage;
