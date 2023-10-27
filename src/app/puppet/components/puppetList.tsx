import { useEffect, useState } from 'react';
import { Puppet } from '@/services/puppet';
import { WebSocketServiceType } from '@/types/websocket';

const PuppetList = () => {
  const [puppets, setPuppets] = useState<Puppet[]>([]);

  useEffect(() => {
    fetchPuppets();
  }, []);

  async function fetchPuppets() {
    const response = await fetch(`/api/puppet/${WebSocketServiceType.ZionSupport}/clients`);
    const data = await response.json();
    setPuppets(data);
  }

  async function deletePuppet(id: string) {
    await fetch(`/api/puppet/${WebSocketServiceType.ZionSupport}/clients/${id}`, { method: 'DELETE' });
    fetchPuppets();
  }

  return (
    <div className="flex flex-col p-2 gap-2 items-center">
    <table className="w-full bg-gray-800 rounded-md">
      <thead>
        <tr>
          <th className="text-center">Client ID</th>
          <th className="text-center">State</th>
          <th className="text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {
          puppets.map((puppet) => (
            <tr key={puppet.clientId}>
              <td className="text-center">{puppet.clientId}</td>
              <td className="text-center">{puppet.state}</td>
              <td className="text-center">
                <button
                  onClick={() => deletePuppet(puppet.clientId)}
                  className="bg-primary text-white px-2 py-1 rounded"
                >
                  删除
                </button>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
    <div>
      <button onClick={fetchPuppets} className="bg-primary text-white px-2 py-1 rounded">刷新连接状态</button>
    </div>
  </div>
  );
};

export default PuppetList;
