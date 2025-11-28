
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal, NewsItem, WeatherType, Upgrade, Stock } from './types';
import { GRID_SIZE, BUILDINGS, TICK_RATE_MS, INITIAL_COOKIES, INITIAL_UPGRADES, INITIAL_STOCKS } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import DigitalID from './components/DigitalID';
import StockMarket from './components/StockMarket';
import { generateCityGoal, generateNewsEvent } from './services/geminiService';

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  const center = GRID_SIZE / 2;

  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      const dist = Math.sqrt((x-center)*(x-center) + (y-center)*(y-center));
      row.push({ x, y, buildingType: BuildingType.None });
    }
    grid.push(row);
  }
  return grid;
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showID, setShowID] = useState(false);
  const [showMarket, setShowMarket] = useState(false);

  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>({ 
    cookies: INITIAL_COOKIES, 
    lifetimeCookies: INITIAL_COOKIES,
    population: 0, 
    day: 1,
    weather: 'sunny' 
  });
  // selectedTool can be null (Cursor/Pointer mode)
  const [selectedTool, setSelectedTool] = useState<BuildingType | null>(null);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  
  const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null);
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  
  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const goalRef = useRef(currentGoal);
  const aiEnabledRef = useRef(aiEnabled);
  const upgradesRef = useRef(upgrades);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { goalRef.current = currentGoal; }, [currentGoal]);
  useEffect(() => { aiEnabledRef.current = aiEnabled; }, [aiEnabled]);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);

  const addNewsItem = useCallback((item: NewsItem) => {
    setNewsFeed(prev => [...prev.slice(-12), item]); 
  }, []);

  const fetchNewGoal = useCallback(async () => {
    if (isGeneratingGoal || !aiEnabledRef.current) return;
    setIsGeneratingGoal(true);
    await new Promise(r => setTimeout(r, 500));
    
    const newGoal = await generateCityGoal(statsRef.current, gridRef.current);
    if (newGoal) {
      setCurrentGoal(newGoal);
    } else {
      if(aiEnabledRef.current) setTimeout(fetchNewGoal, 5000);
    }
    setIsGeneratingGoal(false);
  }, [isGeneratingGoal]); 

  const fetchNews = useCallback(async () => {
    if (!aiEnabledRef.current || Math.random() > 0.15) return; 
    const news = await generateNewsEvent(statsRef.current, null);
    if (news) addNewsItem(news);
  }, [addNewsItem]);

  useEffect(() => {
    if (!gameStarted) return;
    addNewsItem({ id: Date.now().toString(), text: "Gridline OS Online. Bem-vindo, Administrador.", type: 'positive' });
    if (aiEnabled) fetchNewGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  // --- Stock Market Simulation Loop ---
  useEffect(() => {
      if (!gameStarted) return;

      const marketInterval = setInterval(() => {
          setStocks(currentStocks => {
              return currentStocks.map(stock => {
                  // Random price movement based on volatility
                  const changePercent = (Math.random() - 0.5) * 2 * stock.volatility;
                  let newPrice = stock.price * (1 + changePercent);
                  
                  // Clamp price to reasonable limits (minimum 1, max 10000)
                  newPrice = Math.max(1, Math.min(10000, newPrice));
                  
                  // Update history (keep last 20 points)
                  const newHistory = [...stock.history, newPrice].slice(-20);

                  return {
                      ...stock,
                      price: newPrice,
                      history: newHistory
                  };
              });
          });
      }, 5000); // Updates every 5 seconds for excitement

      return () => clearInterval(marketInterval);
  }, [gameStarted]);

  // --- Game Loop ---
  useEffect(() => {
    if (!gameStarted) return;

    const intervalId = setInterval(() => {
      let dailyCookies = 0;
      let dailyPopGrowth = 0;
      let buildingCounts: Record<string, number> = {};

      // Calcular multiplicadores de upgrade
      const multipliers: Record<string, number> = {};
      Object.values(BuildingType).forEach(t => multipliers[t] = 1);
      
      upgradesRef.current.forEach(u => {
        if(u.purchased) {
           if(u.targetType === 'Global') {
              // Simplificação: Global aumenta tudo um pouco, mas aqui vamos ignorar para focar em especificos
           } else {
              multipliers[u.targetType] *= u.multiplier;
           }
        }
      });

      gridRef.current.flat().forEach(tile => {
        if (tile.buildingType !== BuildingType.None) {
          const config = BUILDINGS[tile.buildingType];
          
          const multiplier = multipliers[tile.buildingType] || 1;
          
          dailyCookies += config.cookieGen * multiplier;
          dailyPopGrowth += config.popGen * multiplier; // População também escala com upgrades de eficiência
          buildingCounts[tile.buildingType] = (buildingCounts[tile.buildingType] || 0) + 1;
        }
      });

      // Arredondar para evitar floats feios na UI (C$)
      dailyCookies = Math.floor(dailyCookies);

      const resCount = buildingCounts[BuildingType.Residential] || 0;
      const maxPop = resCount * 50; 

      setStats(prev => {
        let newPop = prev.population + Math.floor(dailyPopGrowth);
        if (newPop > maxPop) newPop = maxPop; 
        if (resCount === 0 && prev.population > 0) newPop = Math.max(0, prev.population - 5); 

        // Weather Cycle: Simple progression Sunny -> Rain -> Sunny -> Night -> Sunny
        let nextWeather: WeatherType = prev.weather;
        if (prev.day % 10 === 0) nextWeather = 'rain';
        else if (prev.day % 10 === 2) nextWeather = 'sunny';
        else if (prev.day % 20 === 15) nextWeather = 'night';
        else if (prev.day % 20 === 19) nextWeather = 'sunny';

        const newStats = {
          cookies: prev.cookies + dailyCookies,
          lifetimeCookies: prev.lifetimeCookies + dailyCookies,
          population: newPop,
          day: prev.day + 1,
          weather: nextWeather
        };
        
        const goal = goalRef.current;
        if (aiEnabledRef.current && goal && !goal.completed) {
          let isMet = false;
          if (goal.targetType === 'cookies' && newStats.cookies >= goal.targetValue) isMet = true;
          if (goal.targetType === 'population' && newStats.population >= goal.targetValue) isMet = true;
          if (goal.targetType === 'building_count' && goal.buildingType) {
            if ((buildingCounts[goal.buildingType] || 0) >= goal.targetValue) isMet = true;
          }

          if (isMet) {
            setCurrentGoal({ ...goal, completed: true });
          }
        }

        return newStats;
      });

      fetchNews();

    }, TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, [fetchNews, gameStarted]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted) return; 

    const currentGrid = gridRef.current;
    const currentStats = statsRef.current;
    const tool = selectedTool; 
    
    // If no tool selected (Cursor mode), do nothing (safe mode)
    if (tool === null) return;

    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const currentTile = currentGrid[y][x];
    const buildingConfig = BUILDINGS[tool];

    if (tool === BuildingType.None) {
      if (currentTile.buildingType !== BuildingType.None) {
        const demolishCost = 5;
        if (currentStats.cookies >= demolishCost) {
            const newGrid = currentGrid.map(row => [...row]);
            newGrid[y][x] = { ...currentTile, buildingType: BuildingType.None };
            setGrid(newGrid);
            setStats(prev => ({ ...prev, cookies: prev.cookies - demolishCost }));
        } else {
            addNewsItem({id: Date.now().toString(), text: "Cookies insuficientes para demolição.", type: 'negative'});
        }
      }
      return;
    }

    if (currentTile.buildingType === BuildingType.None) {
      if (currentStats.cookies >= buildingConfig.cost) {
        setStats(prev => ({ ...prev, cookies: prev.cookies - buildingConfig.cost }));
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[y][x] = { ...currentTile, buildingType: tool };
        setGrid(newGrid);
      } else {
        addNewsItem({id: Date.now().toString() + Math.random(), text: `Precisa de mais Cookies para ${buildingConfig.name}.`, type: 'negative'});
      }
    }
  }, [selectedTool, addNewsItem, gameStarted]);

  const handleSelectTool = (type: BuildingType | null) => {
    // If clicking the already selected tool, deselect it (toggle to cursor)
    if (selectedTool === type) {
      setSelectedTool(null);
    } else {
      setSelectedTool(type);
    }
  };

  const handleClaimReward = () => {
    if (currentGoal && currentGoal.completed) {
      setStats(prev => ({ 
        ...prev, 
        cookies: prev.cookies + currentGoal.reward,
        lifetimeCookies: prev.lifetimeCookies + currentGoal.reward
      }));
      addNewsItem({id: Date.now().toString(), text: `Missão Completa! +${currentGoal.reward} Cookies.`, type: 'positive'});
      setCurrentGoal(null);
      fetchNewGoal();
    }
  };

  const handlePurchaseUpgrade = (id: string) => {
    const upgradeIndex = upgrades.findIndex(u => u.id === id);
    if (upgradeIndex === -1) return;
    
    const upgrade = upgrades[upgradeIndex];
    if (stats.cookies >= upgrade.cost && !upgrade.purchased) {
        setStats(prev => ({...prev, cookies: prev.cookies - upgrade.cost}));
        const newUpgrades = [...upgrades];
        newUpgrades[upgradeIndex] = {...upgrade, purchased: true};
        setUpgrades(newUpgrades);
        addNewsItem({id: Date.now().toString(), text: `Upgrade Adquirido: ${upgrade.name}`, type: 'positive'});
    }
  };
  
  // Market Actions
  const handleBuyStock = (stockId: string, amount: number) => {
      const stockIndex = stocks.findIndex(s => s.id === stockId);
      if (stockIndex === -1) return;
      
      const stock = stocks[stockIndex];
      const totalCost = stock.price * amount;
      
      if (stats.cookies >= totalCost) {
          setStats(prev => ({ ...prev, cookies: prev.cookies - totalCost }));
          const newStocks = [...stocks];
          newStocks[stockIndex] = { ...stock, owned: stock.owned + amount };
          setStocks(newStocks);
      } else {
          addNewsItem({id: Date.now().toString(), text: "Fundo insuficiente para compra de ações.", type: 'negative'});
      }
  };

  const handleSellStock = (stockId: string, amount: number) => {
      const stockIndex = stocks.findIndex(s => s.id === stockId);
      if (stockIndex === -1) return;
      
      const stock = stocks[stockIndex];
      
      if (stock.owned >= amount) {
          const totalValue = stock.price * amount;
          setStats(prev => ({ 
              ...prev, 
              cookies: prev.cookies + totalValue,
              lifetimeCookies: prev.lifetimeCookies + totalValue
          }));
          const newStocks = [...stocks];
          newStocks[stockIndex] = { ...stock, owned: stock.owned - amount };
          setStocks(newStocks);
      }
  };

  const handleStart = (enabled: boolean) => {
    setAiEnabled(enabled);
    setGameStarted(true);
  };

  // Helper to count buildings for UI
  const getBuildingCounts = () => {
      const counts: Record<string, number> = {};
      grid.flat().forEach(tile => {
         if(tile.buildingType !== BuildingType.None) {
             counts[tile.buildingType] = (counts[tile.buildingType] || 0) + 1;
         }
      });
      return counts;
  }

  const skyColor = stats.weather === 'night' ? 'bg-slate-900' : (stats.weather === 'rain' ? 'bg-slate-700' : 'bg-sky-400');

  return (
    <div className={`relative w-screen h-screen overflow-hidden selection:bg-transparent selection:text-transparent ${skyColor} transition-colors duration-[2000ms]`}>
      <IsoMap 
        grid={grid} 
        onTileClick={handleTileClick} 
        hoveredTool={selectedTool}
        population={stats.population}
        weather={stats.weather}
      />
      
      {!gameStarted && (
        <StartScreen onStart={handleStart} />
      )}

      {gameStarted && (
        <UIOverlay
          stats={stats}
          selectedTool={selectedTool}
          onSelectTool={handleSelectTool}
          currentGoal={currentGoal}
          newsFeed={newsFeed}
          onClaimReward={handleClaimReward}
          isGeneratingGoal={isGeneratingGoal}
          aiEnabled={aiEnabled}
          onOpenID={() => setShowID(true)}
          onOpenMarket={() => setShowMarket(true)}
        />
      )}

      {showID && (
          <DigitalID 
            stats={stats}
            upgrades={upgrades}
            onPurchaseUpgrade={handlePurchaseUpgrade}
            onClose={() => setShowID(false)}
            buildingCounts={getBuildingCounts()}
          />
      )}

      {showMarket && (
          <StockMarket
            stats={stats}
            stocks={stocks}
            onBuy={handleBuyStock}
            onSell={handleSellStock}
            onClose={() => setShowMarket(false)}
          />
      )}
    </div>
  );
}

export default App;
