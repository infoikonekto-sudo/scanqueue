import { useState, useCallback, useEffect } from 'react'
import { useToast } from '../../components/shared/Toast'
import { dashboardService } from '../../services/admin'

export const useDashboard = () => {
  const [stats, setStats] = useState(null)
  const [todayData, setTodayData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, todayRes] = await Promise.all([
        dashboardService.stats(),
        dashboardService.today(),
      ])
      setStats(statsRes.data.data)
      setTodayData(todayRes.data.data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchStats()
    // Refrescar cada 30 segundos
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, todayData, loading, refetch: fetchStats }
}

export default useDashboard
