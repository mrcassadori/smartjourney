// Wrapper fino em torno do Chart.js (carregado via CDN em index.html) para uso
// declarativo em componentes React — sem dependência de bindings React
// específicos (ex. react-chartjs-2), consistente com o resto do protótipo
// (tudo via <script> direto, sem build step/npm).

function ChartCanvas({ type, data, options, height }) {
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);
  const dataKey = JSON.stringify(data);
  const optionsKey = JSON.stringify(options || {});

  React.useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type,
      data,
      options: Object.assign(
        { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
        options
      ),
    });
    return () => {
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line
  }, [type, dataKey, optionsKey]);

  return (
    <div style={{ height: height || 220, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

window.ChartCanvas = ChartCanvas;
