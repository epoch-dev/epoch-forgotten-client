import { useState, useEffect } from 'react';
import style from './ServerSwitcherPanel.module.scss';
import { HealthcheckApi } from '../api/.generated';
import axios from 'axios';
import { appConfig } from '../config';

type ServerStatuses = { [key: number]: ServerStatus };
type ServerStatus = 'online' | 'offline' | 'checking';

const servers = [
    { id: 1, name: 'GLOBAL', url: 'https://epoch-forgotten-195038156216.europe-west1.run.app' },
    { id: 2, name: 'KRK', url: 'https://superb-lovely-tetra.ngrok-free.app' },
    { id: 3, name: 'localhost', url: 'http://localhost:3013' },
];

const ServerSwitcherPanel = () => {
    const [serverStatuses, setServerStatuses] = useState<ServerStatuses>({});
    const [activeServer, setActiveServer] = useState<number | null>(null);

    useEffect(() => {
        const checkHealth = async (server: typeof servers[0]) => {
            try {
                const healthcheckClient = new HealthcheckApi(undefined, server.url, axios);
                const response = await healthcheckClient.healthCheck();
                if (response.status === 200 && response.data.status === 'Ok') {
                    return 'online';
                }
                return 'offline';
            } catch {
                return 'offline';
            }
        };

        const checkAllServers = async () => {
            const statuses: ServerStatuses = {};
            for (const server of servers) {
                const status = await checkHealth(server);
                statuses[server.id] = status;
            }
            setServerStatuses(statuses);
        };

        checkAllServers();
    }, []);

    const handleSwitchServer = (serverId: number) => {
        if (serverStatuses[serverId] === 'online') {
            setActiveServer(serverId);
            // todo: set active server for the app
        }
    };

    return (
        <aside>
            <div className={style.serverSwitcher}>
                {servers.map(server => (
                    <div key={server.id} className={style.serverItem}>
                        <button
                            onClick={() => handleSwitchServer(server.id)}
                            className={server.id === activeServer ? style.active : ''}
                            disabled={serverStatuses[server.id] !== 'online'}
                        >
                            {server.name}
                        </button>
                        <div
                            className={`${style.diode} ${serverStatuses[server.id] === 'online' ? style.green : style.red}`}
                        />
                    </div>
                ))}
            </div>
            {activeServer && (
                <div className={style.activeServerInfo}>
                    Active Server: {servers.find(s => s.id === activeServer)?.name}
                </div>
            )}
        </aside>
    );
};

export default ServerSwitcherPanel;
