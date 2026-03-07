"use client"

interface StatsChartsProps {
  upvotes: number
  downvotes: number
  imagesOverTime: any[]
}

export default function StatsCharts({ upvotes, downvotes, imagesOverTime }: StatsChartsProps) {
  const totalVotes = upvotes + downvotes
  const upvotePercent = totalVotes > 0 ? (upvotes / totalVotes) * 100 : 50

  const imagesByDay = imagesOverTime.reduce((acc: any, img) => {
    const date = new Date(img.created_datetime_utc).toLocaleDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toLocaleDateString()
  })

  const imageCountsByDay = last7Days.map(day => imagesByDay[day] || 0)
  const maxCount = Math.max(...imageCountsByDay, 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📊</span> Vote Distribution
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-green-400 font-semibold">👍 Upvotes</span>
              <span className="text-white font-bold">{upvotes} ({upvotePercent.toFixed(1)}%)</span>
            </div>
            <div className="h-8 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                style={{ width: `${upvotePercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-red-400 font-semibold">👎 Downvotes</span>
              <span className="text-white font-bold">{downvotes} ({(100 - upvotePercent).toFixed(1)}%)</span>
            </div>
            <div className="h-8 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                style={{ width: `${100 - upvotePercent}%` }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Overall Sentiment</p>
              <p className={`text-3xl font-bold ${upvotePercent > 50 ? 'text-green-400' : 'text-red-400'}`}>
                {upvotePercent > 50 ? '😊 Positive' : upvotePercent < 50 ? '😞 Negative' : '😐 Neutral'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📈</span> Images Last 7 Days
        </h3>
        
        <div className="h-48 flex items-end justify-between gap-2">
          {imageCountsByDay.map((count, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col justify-end h-full">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:from-purple-400 hover:to-pink-400"
                  style={{ 
                    height: `${(count / maxCount) * 100}%`,
                    minHeight: count > 0 ? '8px' : '0px'
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">{count}</p>
                <p className="text-gray-500 text-xs">
                  {last7Days[i].split('/').slice(0, 2).join('/')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}