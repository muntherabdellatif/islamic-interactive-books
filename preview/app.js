/**
 * Interactive Islamic Heritage Platform Preview
 * app.js - Handles micro-interactions, constellation expansion, and dual linking
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const constellationGroup = document.getElementById('constellation-group');
  const jazariNode = document.getElementById('node-jazari');
  const metaCard = document.getElementById('floating-meta');
  const metaName = document.getElementById('meta-narrator-name');
  const metaBio = document.getElementById('meta-narrator-bio');
  const metaDeath = document.getElementById('meta-narrator-death');
  const metaBadge = document.getElementById('meta-narrator-badge');
  const manuscriptPage = document.querySelector('.manuscript-page');
  const toggleDarkBtn = document.getElementById('toggle-dark-mode');

  // Narrators Data Map
  const narrators = {
    'jazari': {
      name: 'الإمام محمد بن محمد بن الجزري الشافعي',
      badge: 'شيخ الإقراء ومحقق الفن',
      bio: 'إمام القراء وخاتمة المحققين (751 - 833 هـ). صاحب كتاب النشر في القراءات العشر ومنظومة طيبة النشر، جمع أشتات هذا العلم وحرره.',
      death: '833 هـ (شيراز)',
      id: '#IMAM-JAZARI'
    },
    'nafi': {
      name: 'نافع بن عبد الرحمن بن أبي نعيم المدني',
      badge: 'إمام دار الهجرة',
      bio: 'أحد القراء السبعة الأعلام وإمام أهل المدينة في القراءة بعد التابعين، أخذ عن سبعين من التابعين.',
      death: '169 هـ (المدينة المنورة)',
      id: '#QARI-NAFI'
    },
    'ibn_kathir': {
      name: 'عبد الله بن كثير الداري المكي',
      badge: 'إمام مكة المكرمة',
      bio: 'إمام أهل مكة في القراءة، لقي عدداً من الصحابة كعبد الله بن الزبير وأبي أيوب الأنصاري.',
      death: '120 هـ (مكة المكرمة)',
      id: '#QARI-KATHIR'
    },
    'abu_amr': {
      name: 'أبو عمرو زبان بن العلاء البصري',
      badge: 'إمام البصرة ونحويها',
      bio: 'سيد القراء وأعلم الناس باللغة والشعر والعربية، قرأ بمكة والمدينة والبصرة والكوفة.',
      death: '154 هـ (الكوفة)',
      id: '#QARI-AMR'
    },
    'ibn_nazim': {
      name: 'أحمد بن محمد بن الجزري (ابن الناظم)',
      badge: 'تلميذ وراوٍ مباشر',
      bio: 'أكبر أبناء ابن الجزري، شارح طيبة النشر ورواها عن والده عرضاً وسماعاً.',
      death: '859 هـ',
      id: '#SUBNODE-NAZIM'
    },
    'tahir_arab': {
      name: 'طاهر بن عرب الأصبهاني',
      badge: 'طريق طيبة النشر',
      bio: 'من أجلّ أصحاب ابن الجزري وأوثقهم، رحل معه وقرأ عليه العشر الكبرى.',
      death: '856 هـ',
      id: '#SUBNODE-ARAB'
    }
  };

  function updateNarrator(key) {
    const data = narrators[key];
    if (!data) return;
    metaName.textContent = data.name;
    metaBadge.textContent = data.badge;
    metaBio.textContent = data.bio;
    metaDeath.textContent = data.death;
  }

  // Toggle Constellation Expansion
  if (jazariNode) {
    jazariNode.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = constellationGroup.classList.contains('hidden');
      if (isHidden) {
        constellationGroup.classList.remove('hidden');
      } else {
        constellationGroup.classList.add('hidden');
      }
      updateNarrator('jazari');
    });
  }

  // Sub-nodes selection
  document.querySelectorAll('.c-node, .node').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = node.getAttribute('data-narrator');
      if (key) {
        updateNarrator(key);
      }
    });
  });

  // Toggle Dark Emerald Slate mode for manuscript
  if (toggleDarkBtn) {
    toggleDarkBtn.addEventListener('click', () => {
      manuscriptPage.classList.toggle('dark-slate');
      toggleDarkBtn.classList.toggle('active-gold');
    });
  }
});
