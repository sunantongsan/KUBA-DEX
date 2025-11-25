import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { BlockchainService } from '../services/blockchain';
import { LaunchpadProject } from '../types';
import { Rocket, Users, Calendar, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Launchpad: React.FC = () => {
  const [projects, setProjects] = useState<LaunchpadProject[]>([]);

  useEffect(() => {
    BlockchainService.getProjects().then(setProjects);
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">
            Kuba <span className="text-kuba">Launchpad</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
            The premier platform for launching new projects on TON. Decentralized, fair, and efficient fundraising with automated liquidity locking.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link to={`/launchpad/${project.id}`} key={project.id} className="group">
            <Card className="h-full hover:border-kuba/40 transition-all duration-300 group-hover:-translate-y-1">
              <div className="relative h-40 mb-12">
                <img 
                    src={project.banner || 'https://picsum.photos/seed/kubabg/800/300'} 
                    className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent"></div>
                <img 
                    src={project.logo} 
                    className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl border-4 border-dark-card shadow-lg" 
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                    project.status === 'LIVE' ? 'bg-kuba text-black animate-pulse' : 
                    project.status === 'ENDED' ? 'bg-gray-700 text-gray-300' : 'bg-blue-500 text-white'
                }`}>
                    {project.status}
                </div>
              </div>
              
              <div className="px-2">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    {project.name} <span className="text-gray-500 text-sm font-normal">({project.ticker})</span>
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                    {project.description}
                </p>
                
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Raise Goal</span>
                        <span className="text-white font-medium">{project.raiseGoal.toLocaleString()} TON</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Price</span>
                        <span className="text-kuba font-medium">{project.price} TON</span>
                    </div>
                    
                    <div className="w-full bg-white/5 rounded-full h-2 mt-2">
                        <div 
                            className="bg-kuba h-2 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min((project.raisedAmount / project.raiseGoal) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{((project.raisedAmount / project.raiseGoal) * 100).toFixed(1)}%</span>
                        <span>{project.raisedAmount}/{project.raiseGoal} TON</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Users size={14} /> 128 Participants</span>
                    <span className="flex items-center gap-1"><Timer size={14} /> {project.status === 'LIVE' ? 'Ends in 2d' : 'Ended'}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};