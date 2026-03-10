import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Wallet, 
  Receipt, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  totalBalance: number;
  totalTransactions: number;
  todayTransactions: number;
  recentTransactions: any[];
  transactionVolume: number;
  transactionVolume24h: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all stats in parallel
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalUsers },
        { data: wallets },
        { count: totalTransactions },
        { data: todayTxns },
        { data: recentTxns },
        { data: volumeData },
        { data: volume24hData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('wallets').select('balance'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('id').gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('transactions').select(`
          *,
          profiles!transactions_user_id_fkey(full_name, email)
        `).order('created_at', { ascending: false }).limit(10),
        supabase.from('transactions').select('amount, type').eq('status', 'completed'),
        supabase.from('transactions').select('amount').eq('status', 'completed').gte('created_at', last24h)
      ]);

      const totalBalance = wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;
      const transactionVolume = volumeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const transactionVolume24h = volume24hData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalBalance,
        totalTransactions: totalTransactions || 0,
        todayTransactions: todayTxns?.length || 0,
        recentTransactions: recentTxns || [],
        transactionVolume,
        transactionVolume24h
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Wallet Balance',
      value: `₦${stats?.totalBalance?.toLocaleString() || '0'}`,
      icon: Wallet,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Transactions',
      value: stats?.totalTransactions?.toLocaleString() || '0',
      icon: Receipt,
      color: 'bg-purple-500',
      change: '+24%'
    },
    {
      title: 'Transaction Volume',
      value: `₦${stats?.transactionVolume?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to SM Data Sub Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change} this month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Transactions Today</span>
                <span className="font-bold text-lg">{stats?.todayTransactions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats?.recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                stats?.recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {txn.type === 'credit' ? (
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{txn.category}</p>
                        <p className="text-xs text-gray-500">
                          {txn.profiles?.full_name || 'Unknown'} • {format(new Date(txn.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                      </p>
                      <p className={`text-xs ${txn.status === 'completed' ? 'text-green-500' : txn.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {txn.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
