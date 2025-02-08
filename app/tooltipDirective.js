export default {
  mounted(el, binding) {
    let tooltip;
    
    el.addEventListener('mouseenter', () => {
      tooltip = document.createElement('div');
      tooltip.textContent = binding.value;
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = '#f1f1f1';
      tooltip.style.color = '#000';
      tooltip.style.padding = '5px';
      tooltip.style.borderRadius = '5px';
      tooltip.style.fontSize = '12px';
      tooltip.style.zIndex = '2000'; // 设置z-index为较大的值
      
      document.body.appendChild(tooltip);
      
      const rect = el.getBoundingClientRect();
      tooltip.style.left = `${rect.right + window.scrollX}px`; // 设置tooltip在元素的右侧
      tooltip.style.top = `${rect.top + window.scrollY-10}px`; // 保持tooltip与元素在同一高度
    });

    el.addEventListener('mouseleave', () => {
      document.body.removeChild(tooltip);
    });
  }
};
