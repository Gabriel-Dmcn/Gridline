
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, BuildingType, CityStats, AIGoal, NewsItem, WeatherType, Upgrade, Stock, PlayerConfig, Policy } from './types';
import { GRID_SIZE, BUILDINGS, TICK_RATE_MS, INITIAL_COOKIES, INITIAL_UPGRADES, INITIAL_STOCKS, POLICIES } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import DigitalID from './components/DigitalID';
import StockMarket from './components/StockMarket';
import CharacterCreator from './components/CharacterCreator';
import BuildingInspector from './components/BuildingInspector';
import CityPolicies from './components/CityPolicies';
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
  const [showPolicies, setShowPolicies] = useState(false);
  const [inspectedBuilding, setInspectedBuilding] = useState<BuildingType | null>(null);

  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<CityStats>({ 
    cookies: INITIAL_COOKIES, 
    lifetimeCookies: INITIAL_COOKIES,
    population: 0, 
    day: 1,
    weather: 'sunny',
    satisfaction: {
        total: 50,
        transport: 50,
        environment: 50,
        safety: 50,
        education: 50,
        leisure: 50
    },
    energy: {
        produced: 0,
        consumed: 0,
        balance: 0
    },
    activePolicies: []
  });
  
  // Player Avatar State
  const [player, setPlayer] = useState<PlayerConfig>({
      name: 'Prefeito',
      color: '#eab308',
      hat: 'cap',
      x: Math.floor(GRID_SIZE/2),
      y: Math.floor(GRID_SIZE/2),
      path: [],
      pantsColor: '#1e293b',
      shoeColor: '#000000',
      face: 'happy'
  });

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

  // --- Auto Save/Load System ---
  useEffect(() => {
    // Load on Mount
    const savedData = localStorage.getItem('gridline_save');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            if(data.grid) setGrid(data.grid);
            if(data.stats) setStats(data.stats);
            if(data.player) setPlayer(data.player);
            if(data.upgrades) setUpgrades(data.upgrades);
            if(data.stocks) setStocks(data.stocks);
            // Don't auto-start to allow main menu
        } catch(e) {
            console.error("Save file corrupt", e);
        }
    }
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    const saveInterval = setInterval(() => {
        const dataToSave = {
            grid: gridRef.current,
            stats: statsRef.current,
            player: player,
            upgrades: upgradesRef.current,
            stocks: stocks
        };
        localStorage.setItem('gridline_save', JSON.stringify(dataToSave));
        console.log("Auto-saved game");
    }, 10000); // Save every 10s
    return () => clearInterval(saveInterval);
  }, [gameStarted, player, stocks]);


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
    if (!showCharCreator) {
        // Goal fetching init
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

  // --- Satisfaction Calculation Helper ---
  const calculateSatisfaction = (counts: Record<string, number>): {total: number, breakdown: any} => {
    const resCount = counts[BuildingType.Residential] || 0;
    const indCount = counts[BuildingType.Industrial] || 0;
    
    const roads = counts[BuildingType.Road] || 0;
    const metro = counts[BuildingType.Metro] || 0;
    let transport = 40 + Math.min(60, ((roads * 1 + metro * 10) / (resCount || 1)) * 20);

    const green = (counts[BuildingType.Park] || 0) + (counts[BuildingType.SolarFarm] || 0) + (counts[BuildingType.WindTurbine] || 0);
    let environment = 50 + (green * 5) - (indCount * 8);
    environment = Math.max(0, Math.min(100, environment));

    const safe = (counts[BuildingType.Hospital] || 0) + (counts[BuildingType.CityHall] || 0);
    let safety = 40 + Math.min(60, safe * 15);

    const schools = counts[BuildingType.School] || 0;
    let education = 30 + Math.min(70, schools * 20);

    const leisureBuildings = (counts[BuildingType.BeachResort] || 0) + (counts[BuildingType.Commercial] || 0);
    let leisure = 40 + Math.min(60, leisureBuildings * 10);

    const total = Math.floor((transport + environment + safety + education + leisure) / 5);

    return {
        total,
        breakdown: { transport, environment, safety, education, leisure }
    };
  };

  // --- Game Loop ---
  useEffect(() => {
    if (!gameStarted) return;

    const intervalId = setInterval(() => {
      let dailyCookies = 0;
      let dailyPopGrowth = 0;
      let totalEnergyProduced = 0;
      let totalEnergyConsumed = 0;
      let buildingCounts: Record<string, number> = {};

      // 1. Calculate Multipliers (Upgrades + Policies)
      const multipliers: Record<string, number> = {};
      Object.values(BuildingType).forEach(t => multipliers[t] = 1);
      let globalCookieMultiplier = 1;

      // Upgrades
      upgradesRef.current.forEach(u => {
        if(u.purchased) {
           if(u.targetType === 'Global') {
               globalCookieMultiplier *= u.multiplier;
           } else {
              multipliers[u.targetType] *= u.multiplier;
           }
        }
      });

      // Policies
      let policyCost = 0;
      statsRef.current.activePolicies.forEach(policyId => {
          const policy = POLICIES.find(p => p.id === policyId);
          if (policy) {
              policyCost += policy.costPerTick;
              if (policy.effect.target === 'cookies' && policy.effect.type === 'multiplier') {
                  globalCookieMultiplier *= policy.effect.value;
              }
              // Other effects handled in satisfaction/pop logic later
          }
      });

      // 2. Iterate Buildings
      gridRef.current.flat().forEach(tile => {
        if (tile.buildingType !== BuildingType.None) {
          const config = BUILDINGS[tile.buildingType];
          const multiplier = multipliers[tile.buildingType] || 1;
          
          dailyCookies += config.cookieGen * multiplier;
          dailyPopGrowth += config.popGen * multiplier; 
          
          const eDelta = config.energyDelta; // Base energy
          // Apply Upgrade buffs to energy production (Smart Grid)
          let eMult = 1;
          if ((tile.buildingType === BuildingType.WindTurbine || tile.buildingType === BuildingType.SolarFarm) && multipliers[BuildingType.WindTurbine] > 1) {
              eMult = multipliers[BuildingType.WindTurbine]; // Reuse Smart Grid logic
          }

          if (eDelta > 0) totalEnergyProduced += eDelta * eMult;
          else totalEnergyConsumed += Math.abs(eDelta);

          buildingCounts[tile.buildingType] = (buildingCounts[tile.buildingType] || 0) + 1;
        }
      });

      // 3. Energy Penalty
      const energyBalance = totalEnergyProduced - totalEnergyConsumed;
      if (energyBalance < 0) {
          globalCookieMultiplier *= 0.5; // Blackout penalty
          if (statsRef.current.energy.balance >= 0) {
             addNewsItem({id: Date.now().toString(), text: "APAGÃO! Produção reduzida em 50%. Construa mais energia!", type: 'negative'});
          }
      }

      dailyCookies = Math.floor(dailyCookies * globalCookieMultiplier) - policyCost;

      // 4. Update Stats
      const resCount = buildingCounts[BuildingType.Residential] || 0;
      const maxPop = resCount * 50; 

      setStats(prev => {
        let newPop = prev.population + Math.floor(dailyPopGrowth);
        
        // Policy Pop Buff
        const popPolicy = prev.activePolicies.find(id => id === 'night_life');
        if (popPolicy) newPop = Math.floor(newPop * 1.1);

        if (newPop > maxPop) newPop = maxPop; 
        if (resCount === 0 && prev.population > 0) newPop = Math.max(0, prev.population - 5); 

        // Weather Cycle
        let nextWeather: WeatherType = prev.weather;
        if (prev.day % 10 === 0) nextWeather = 'rain';
        else if (prev.day % 10 === 2) nextWeather = 'sunny';
        else if (prev.day % 20 === 15) nextWeather = 'night';
        else if (prev.day % 20 === 19) nextWeather = 'sunny';

        // Satisfaction
        const satData = calculateSatisfaction(buildingCounts);
        
        // Apply Policy Satisfaction Buffs
        prev.activePolicies.forEach(pid => {
            const p = POLICIES.find(pol => pol.id === pid);
            if (p && p.effect.target === 'satisfaction') satData.total += p.effect.value;
        });
        satData.total = Math.min(100, satData.total);

        const newStats = {
          ...prev,
          cookies: prev.cookies + dailyCookies,
          lifetimeCookies: prev.lifetimeCookies + Math.max(0, dailyCookies),
          population: newPop,
          day: prev.day + 1,
          weather: nextWeather,
          satisfaction: {
              ...satData.breakdown,
              total: satData.total
          },
          energy: {
              produced: totalEnergyProduced,
              consumed: totalEnergyConsumed,
              balance: energyBalance
          }
        };
        
        // Goal Check
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
    
    // Mode 1: Cursor Mode (Move or Inspect)
    if (tool === null) {
        const clickedType = currentGrid[y][x].buildingType;
        if (clickedType !== BuildingType.None && clickedType !== BuildingType.Road) {
             setInspectedBuilding(clickedType);
             return;
        }
        const path = findPath({x: player.x, y: player.y}, {x, y}, currentGrid);
        if (path.length > 0) {
            setPlayer(prev => ({ ...prev, path }));
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
      // Check Unlock Condition
      if (stats.population < buildingConfig.unlockPop) {
          addNewsItem({id: Date.now().toString(), text: `Requer ${buildingConfig.unlockPop} habitantes!`, type: 'negative'});
          return;
      }

      if (currentStats.cookies >= buildingConfig.cost) {
        setStats(prev => ({ ...prev, cookies: prev.cookies - buildingConfig.cost }));
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[y][x] = { ...currentTile, buildingType: tool };
        setGrid(newGrid);
      } else {
        addNewsItem({id: Date.now().toString() + Math.random(), text: `Precisa de mais Cookies para ${buildingConfig.name}.`, type: 'negative'});
      }
    }
  }, [selectedTool, addNewsItem, gameStarted, showCharCreator, player, stats.population]);

  const handleAvatarClick = () => {
     setShowCharCreator(true);
     setIsInitialCharSetup(false);
  };

  const handleReachStep = (x: number, y: number) => {
      setPlayer(prev => {
          const newPath = [...prev.path];
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
    setSelectedTool(type);
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

  const handleTogglePolicy = (policyId: string) => {
      setStats(prev => {
          const isActive = prev.activePolicies.includes(policyId);
          const newPolicies = isActive 
              ? prev.activePolicies.filter(id => id !== policyId)
              : [...prev.activePolicies, policyId];
          return { ...prev, activePolicies: newPolicies };
      });
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
  
  const hasCityHall = getBuildingCounts()[BuildingType.CityHall] > 0;
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
          onOpenPolicies={() => setShowPolicies(true)}
          hasCityHall={hasCityHall}
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
      
      {showPolicies && (
          <CityPolicies 
            policies={POLICIES}
            activePolicies={stats.activePolicies}
            onTogglePolicy={handleTogglePolicy}
            onClose={() => setShowPolicies(false)}
            cookiesPerTick={0} // Not used for now, just visual
          />
      )}

      {inspectedBuilding && (
          <BuildingInspector 
             type={inspectedBuilding}
             stats={stats}
             availableUpgrades={upgrades.filter(u => u.targetType === inspectedBuilding)}
             onUpgrade={handlePurchaseUpgrade}
             onClose={() => setInspectedBuilding(null)}
          />
      )}
    </div>
  );
}

export default App;
