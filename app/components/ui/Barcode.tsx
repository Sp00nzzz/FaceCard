export function Barcode() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0',
          height: '50px',
        }}
      >
        {Array.from({ length: 90 }).map((_, index) => {
          // Create realistic barcode pattern with varying bar widths
          const patterns = [
            2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2,
            4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2,
            3, 2, 2, 3, 2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3,
            2, 4, 2, 3, 2, 2, 3, 2, 4, 2, 3, 2, 3, 2, 2, 3, 2, 4, 2, 3,
            2, 2, 3, 2, 4, 2, 3, 2, 3, 2,
          ]
          const barWidth = patterns[index % patterns.length]
          const isBar = index % 2 === 0

          return (
            <div
              key={index}
              style={{
                width: `${barWidth}px`,
                height: '50px',
                backgroundColor: isBar ? '#000000' : 'transparent',
                display: 'inline-block',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
