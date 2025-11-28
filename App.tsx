
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal, NewsItem, WeatherType, Upgrade, Stock, PlayerConfig } from './types';
import { GRID_SIZE, BUILDINGS, TICK_RATE_MS, INITIAL_COOKIES, INITIAL_UPGRADES, INITIAL_STOCKS } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import DigitalID from './components/DigitalID';
import StockMarket from './components/StockMarket';
import CharacterCreator from './components/CharacterCreator';
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

// Simple BFS Pathfinding
const findPath = (start: {x: number, y: number}, end: {x: number, y: number}, grid: Grid): {x: number, y: number}[] => {
    // Only None (grass), Park, and Road are walkable
    const isWalkable = (x: number, y: number) => {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
        const type = grid[y][x].buildingType;
        return type === BuildingType.None || type === BuildingType.Road || type === BuildingType.Park;
    };

    if (!isWalkable(end.x, end.y)) return [];

    const queue = [{ x: start.x, y: start.y, path: [] as {x: number, y: number}[] }];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
        const { x, y, path } = queue.shift()!;

        if (x === end.x && y === end.y) return path;

        const neighbors = [
            { x: x + 1, y }, { x: x - 1, y },
            { x, y: y + 1 }, { x, y: y - 1 }
        ];

        for (const n of neighbors) {
            const key = `${n.x},${n.y}`;
            if (isWalkable(n.x, n.y) && !visited.has(key)) {
                visited.add(key);
                queue.push({ x: n.x, y: n.y, path: [...path, { x: n.x, y: n.y }] });
            }
        }
    }
    return [];
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showCharCreator, setShowCharCreator] = useState(false);
  const [isInitialCharSetup, setIsInitialCharSetup] = useState(false);
  
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
  
  // Player Avatar State
  const [player, setPlayer] = useState<PlayerConfig>({
      name: 'Prefeito',
      color: '#eab308',
      hat: 'cap',
      x: Math.floor(GRID_SIZE/2),
      y: Math.floor(GRID_SIZE/2),
      path: []
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
    // Initial news only after game fully starts (after char creator)
    if (!showCharCreator) {
        // Goal fetching is handled in game loop or separate effect, but let's ensure it starts
    }
  }, [gameStarted, showCharCreator]);

  // --- Stock Market Simulation Loop ---
  useEffect(() => {
      if (!gameStarted) return;

      const marketInterval = setInterval(() => {
          setStocks(currentStocks => {
              return currentStocks.map(stock => {
                  const changePercent = (Math.random() - 0.5) * 2 * stock.volatility;
                  let newPrice = stock.price * (1 + changePercent);
                  newPrice = Math.max(1, Math.min(10000, newPrice));
                  const newHistory = [...stock.history, newPrice].slice(-20);
                  return { ...stock, price: newPrice, history: newHistory };
              });
          });
      }, 5000);

      return () => clearInterval(marketInterval);
  }, [gameStarted]);

  // --- Game Loop ---
  useEffect(() => {
    if (!gameStarted) return;

    const intervalId = setInterval(() => {
      let dailyCookies = 0;
      let dailyPopGrowth = 0;
      let buildingCounts: Record<string, number> = {};

      const multipliers: Record<string, number> = {};
      Object.values(BuildingType).forEach(t => multipliers[t] = 1);
      
      upgradesRef.current.forEach(u => {
        if(u.purchased) {
           if(u.targetType === 'Global') {
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
          dailyPopGrowth += config.popGen * multiplier; 
          buildingCounts[tile.buildingType] = (buildingCounts[tile.buildingType] || 0) + 1;
        }
      });

      dailyCookies = Math.floor(dailyCookies);
      const resCount = buildingCounts[BuildingType.Residential] || 0;
      const maxPop = resCount * 50; 

      setStats(prev => {
        let newPop = prev.population + Math.floor(dailyPopGrowth);
        if (newPop > maxPop) newPop = maxPop; 
        if (resCount === 0 && prev.population > 0) newPop = Math.max(0, prev.population - 5); 

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

  // --- Handlers ---

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!gameStarted || showCharCreator) return; 

    const currentGrid = gridRef.current;
    const currentStats = statsRef.current;
    const tool = selectedTool; 
    
    // Mode 1: Movement (Cursor Mode)
    if (tool === null) {
        // Calculate Path
        const path = findPath({x: player.x, y: player.y}, {x, y}, currentGrid);
        if (path.length > 0) {
            setPlayer(prev => ({ ...prev, path }));
        } else {
            // Can't move there logic (maybe shake cursor?)
        }
        return;
    }

    // Mode 2: Building/Demolish
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const currentTile = currentGrid[y][x];
    const buildingConfig = BUILDINGS[tool];

    // Don't build on top of player
    if (x === player.x && y === player.y) {
        addNewsItem({id: Date.now().toString(), text: "Não pode construir em cima do prefeito!", type: 'negative'});
        return;
    }

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
  }, [selectedTool, addNewsItem, gameStarted, showCharCreator, player]);

  const handleAvatarClick = () => {
     setShowCharCreator(true);
     setIsInitialCharSetup(false);
  };

  const handleReachStep = (x: number, y: number) => {
      setPlayer(prev => {
          const newPath = [...prev.path];
          // Remove the first element (the step we just reached)
          if(newPath.length > 0 && newPath[0].x === x && newPath[0].y === y) {
              newPath.shift();
          }
          return {
              ...prev,
              x: x,
              y: y,
              path: newPath
          }
      });
  };

  const handleSelectTool = (type: BuildingType | null) => {
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
          addNewsItem({id: Date.now().toString(), text: "Fundo insuficiente.", type: 'negative'});
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
    setIsInitialCharSetup(true);
    setShowCharCreator(true);
  };

  const handleSaveCharacter = (config: PlayerConfig) => {
    setPlayer(config);
    setShowCharCreator(false);
    if (isInitialCharSetup) {
        setGameStarted(true);
        addNewsItem({ id: Date.now().toString(), text: "Gridline OS Online. Bem-vindo, Prefeito " + config.name, type: 'positive' });
        if (aiEnabledRef.current) fetchNewGoal();
    }
  };

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
        player={player}
        onAvatarClick={handleAvatarClick}
        onReachStep={handleReachStep}
      />
      
      {!gameStarted && !showCharCreator && (
        <StartScreen onStart={handleStart} />
      )}

      {showCharCreator && (
          <CharacterCreator 
            initialConfig={player}
            onSave={handleSaveCharacter}
            isInitialSetup={isInitialCharSetup}
          />
      )}

      {gameStarted && !showCharCreator && (
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
