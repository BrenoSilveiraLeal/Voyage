/* Voyage — dados do site.
   Para adicionar um destino, copie um objeto de DESTS e troque os campos.
   x / y = posição no mapa estilizado (x de 0 a 100, y de 0 a 70).
   map.km = quantos km vale 1 unidade do mapa (usado para calcular as distâncias). */
window.VOYAGE = (() => {
  const CATS = {
    praia: { label: 'Praia', color: '#2a9fb4' },
    cultura: { label: 'Cultura', color: '#c8553a' },
    natureza: { label: 'Natureza', color: '#4f7a45' },
    gastronomia: { label: 'Gastronomia', color: '#d08a2c' },
    mirante: { label: 'Mirante', color: '#6b4fa0' },
  };

  const TYPES = { Hotel: 'Hotel', Resort: 'Resort', Casa: 'Casa inteira' };

  const AMEN = {
    wifi: 'Wi-Fi rápido', pool: 'Piscina', spa: 'Spa', breakfast: 'Café da manhã', ac: 'Ar-condicionado',
    kitchen: 'Cozinha equipada', view: 'Vista panorâmica', parking: 'Estacionamento', beach: 'Pé na areia',
    fire: 'Lareira', bike: 'Bicicletas', onsen: 'Ofurô', gym: 'Academia', pet: 'Aceita pets',
  };

  // Paletas dos interiores (parede, piso, madeira, cor de destaque, tecidos) e estilo do telhado da fachada
  const PAL = {
    japan: { wall: '#efe2cc', floor: '#b98c5e', wood: '#6b4529', accent: '#2f4a3e', fabric: '#f6efe2', roof: 'curved' },
    tropical: { wall: '#f3eadb', floor: '#a8794e', wood: '#5e3b22', accent: '#1a8f8a', fabric: '#fbf6ee', roof: 'pitched' },
    greek: { wall: '#fbfaf6', floor: '#e6ddcf', wood: '#b08a62', accent: '#2b6cc4', fabric: '#ffffff', roof: 'dome' },
    italian: { wall: '#f6e6c8', floor: '#d39a63', wood: '#7a4f2e', accent: '#e0a21b', fabric: '#fbf3e3', roof: 'flat' },
    andes: { wall: '#ead8bd', floor: '#9a6a43', wood: '#5a3a24', accent: '#b8432f', fabric: '#efe4d0', roof: 'tile' },
    beach: { wall: '#f6efe2', floor: '#d8c3a0', wood: '#9b7350', accent: '#2a9fb4', fabric: '#fffaf2', roof: 'thatch' },
    mountain: { wall: '#e8dccb', floor: '#7d5a3e', wood: '#4e3423', accent: '#6f955f', fabric: '#efe6d6', roof: 'pitched' },
    cerrado: { wall: '#efdcc0', floor: '#b9774f', wood: '#6e4128', accent: '#c0703f', fabric: '#f5ead8', roof: 'thatch' },
  };

  const DESTS = [
    /* ================= MUNDO ================= */
    {
      id: 'kyoto', name: 'Kyoto', country: 'Japão', region: 'Kansai', tab: 'mundo', scene: 'kyoto',
      sky: ['#f3b7a6', '#f9dcc4'], days: 8, price: '14.900', best: 'mar–mai · out–nov', currency: 'Iene (¥)',
      lang: 'Japonês', tz: '+12 h', flight: '~24 h com conexão',
      tagline: 'Templos, bambuzais e lanternas acesas no fim da tarde.',
      desc: 'A antiga capital imperial guarda mais de 1.600 templos, ruelas de madeira em Gion e uma das culinárias mais refinadas do mundo. Vá na florada das cerejeiras ou no outono vermelho.',
      map: { style: 'land', km: 0.15, rivers: ['M54 0 C57 20 52 42 58 70', 'M0 40 C10 36 16 40 22 46 S30 60 26 70'], hills: [[12, 10, 10], [88, 18, 9], [84, 58, 8]] },
      attractions: [
        { id: 'fushimi', name: 'Fushimi Inari Taisha', cat: 'cultura', x: 64, y: 60, time: '2–3 h', price: 'Grátis', desc: 'Milhares de portões torii vermelhos sobem a montanha em túneis. Vá cedo para pegar as trilhas vazias.' },
        { id: 'arashiyama', name: 'Bambuzal de Arashiyama', cat: 'natureza', x: 10, y: 28, time: '1–2 h', price: 'Grátis', desc: 'Um corredor de bambus gigantes que estalam com o vento, ao lado do templo Tenryū-ji.' },
        { id: 'kinkakuji', name: 'Kinkaku-ji, o Pavilhão Dourado', cat: 'cultura', x: 28, y: 12, time: '1 h', price: '¥ 500', desc: 'O pavilhão coberto de folhas de ouro, refletido num lago espelhado, é o cartão-postal da cidade.' },
        { id: 'gion', name: 'Distrito de Gion', cat: 'cultura', x: 66, y: 29, time: '2 h', price: 'Grátis', desc: 'Casas de chá de madeira, lanternas de papel e, com sorte, uma gueixa a caminho do trabalho.' },
        { id: 'nishiki', name: 'Mercado Nishiki', cat: 'gastronomia', x: 47, y: 34, time: '1–2 h', price: 'Livre', desc: 'Cinco quarteirões de barracas com tamagoyaki, tofu fresco, picles e doces de matchá.' },
        { id: 'kiyomizu', name: 'Terraço do Kiyomizu-dera', cat: 'mirante', x: 76, y: 45, time: '1–2 h', price: '¥ 400', desc: 'Um terraço de madeira suspenso sobre a encosta, com vista da cidade inteira.' },
      ],
      stays: [
        { id: 'hinoki', name: 'Ryokan Hinoki-ya', type: 'Hotel', x: 70, y: 37, price: 1180, rating: 4.9, reviews: 312, guests: 2, beds: 1, baths: 1, vista: 'city', palette: 'japan', amen: ['onsen', 'breakfast', 'wifi', 'ac', 'view'], rooms: ['facade', 'bedroom', 'bath', 'living', 'view'], desc: 'Pousada tradicional em madeira de cipreste, com tatame, futon, jantar kaiseki e ofurô privativo. A 5 minutos a pé das lanternas de Gion.' },
        { id: 'kamo', name: 'Kamo River Resort & Spa', type: 'Resort', x: 57, y: 19, price: 1650, rating: 4.8, reviews: 540, guests: 3, beds: 2, baths: 1, vista: 'hills', palette: 'japan', accent: '#8a3b2e', amen: ['spa', 'pool', 'breakfast', 'gym', 'wifi', 'view'], rooms: ['pool', 'facade', 'bedroom', 'living', 'view'], desc: 'Jardim zen, spa com águas termais e quartos com varanda virada para as montanhas de Higashiyama.' },
        { id: 'machiya', name: 'Machiya Sakura', type: 'Casa', x: 17, y: 36, price: 890, rating: 4.85, reviews: 128, guests: 4, beds: 2, baths: 1, vista: 'hills', palette: 'japan', accent: '#b8503e', amen: ['kitchen', 'wifi', 'ac', 'bike', 'onsen'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa geminada de 1920 restaurada, com pátio interno, cozinha completa e bicicletas para chegar ao bambuzal em 6 minutos.' },
      ],
    },
    {
      id: 'krabi', name: 'Krabi', country: 'Tailândia', region: 'Mar de Andamão', tab: 'mundo', scene: 'karst',
      sky: ['#79c9d3', '#fde4c0'], days: 9, price: '11.200', best: 'nov–abr', currency: 'Baht (฿)',
      lang: 'Tailandês', tz: '+10 h', flight: '~22 h com conexão',
      tagline: 'Paredões de calcário saindo de um mar cor de piscina.',
      desc: 'Krabi é a porta de entrada para Railay, Phi Phi e as ilhas Hong. Barcos long-tail, templos no alto da montanha e comida de rua até tarde da noite.',
      map: { style: 'sea', km: 0.5, land: 'M28 0 H100 V46 C90 44 82 50 70 48 S54 40 46 46 S34 50 28 46 C24 40 30 30 26 20 S24 6 28 0Z', blobs: [[14, 58, 4], [80, 62, 5], [86, 57, 2.5], [12, 40, 2], [18, 30, 2.5], [60, 62, 1.8]] },
      attractions: [
        { id: 'railay', name: 'Praia de Railay', cat: 'praia', x: 32, y: 44, time: 'Meio dia', price: 'Grátis', desc: 'Só se chega de barco: areia branca, escaladores nos paredões e pôr do sol na face oeste.' },
        { id: 'maya', name: 'Maya Bay, Phi Phi Leh', cat: 'praia', x: 80, y: 62, time: 'Dia inteiro', price: '฿ 400', boat: true, desc: 'A baía cercada por falésias que ficou famosa no cinema, hoje com visitas controladas para proteger os corais.' },
        { id: 'tigercave', name: 'Templo Tiger Cave', cat: 'cultura', x: 74, y: 16, time: '2–3 h', price: 'Grátis', desc: '1.237 degraus até um Buda dourado no topo da montanha, com vista de toda a costa.' },
        { id: 'hong', name: 'Ilhas Hong', cat: 'natureza', x: 14, y: 58, time: 'Dia inteiro', price: '฿ 300', boat: true, desc: 'Uma lagoa escondida dentro de uma ilha, caiaque entre manguezais e água rasa transparente.' },
        { id: 'aonang', name: 'Mercado noturno de Ao Nang', cat: 'gastronomia', x: 46, y: 41, time: '2 h', price: 'Livre', desc: 'Pad thai feito na hora, manga com arroz doce e espetinhos à beira-mar.' },
      ],
      stays: [
        { id: 'andaman', name: 'Andaman Cove Resort', type: 'Resort', x: 37, y: 41, price: 1420, rating: 4.9, reviews: 806, guests: 3, beds: 1, baths: 1, vista: 'sea', palette: 'tropical', amen: ['pool', 'spa', 'beach', 'breakfast', 'gym', 'wifi'], rooms: ['pool', 'facade', 'bedroom', 'living', 'view'], desc: 'Villas com piscina privativa voltadas para o mar e um píer próprio de onde saem os barcos para Railay.' },
        { id: 'aonangloft', name: 'Ao Nang Loft Hotel', type: 'Hotel', x: 52, y: 36, price: 520, rating: 4.6, reviews: 1204, guests: 2, beds: 1, baths: 1, vista: 'sea', palette: 'tropical', accent: '#e4553b', amen: ['pool', 'breakfast', 'wifi', 'ac'], rooms: ['facade', 'bedroom', 'bath', 'pool', 'view'], desc: 'Hotel boutique a duas quadras da praia e do mercado noturno, com rooftop e piscina de borda infinita.' },
        { id: 'longtail', name: 'Villa Long-tail', type: 'Casa', x: 62, y: 27, price: 980, rating: 4.8, reviews: 96, guests: 6, beds: 3, baths: 2, vista: 'hills', palette: 'tropical', accent: '#3e8463', amen: ['pool', 'kitchen', 'wifi', 'ac', 'parking'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'pool'], desc: 'Casa de madeira tailandesa com 3 quartos no meio da selva, piscina própria e vista para os paredões.' },
      ],
    },
    {
      id: 'santorini', name: 'Santorini', country: 'Grécia', region: 'Cíclades', tab: 'mundo', scene: 'santorini',
      sky: ['#8fcaf0', '#fbe8d0'], days: 7, price: '12.800', best: 'mai–out', currency: 'Euro (€)',
      lang: 'Grego', tz: '+5 h', flight: '~16 h com conexão',
      tagline: 'Casas brancas penduradas sobre uma cratera no mar Egeu.',
      desc: 'A ilha nasceu de uma erupção vulcânica. Hoje, vilas brancas de cúpulas azuis se debruçam sobre a caldeira, com vinhos minerais e praias de areia vermelha e preta.',
      map: { style: 'sea', km: 0.2, land: 'M30 6 C40 4 50 10 56 18 C64 28 72 34 84 40 C92 46 90 58 78 62 C64 66 50 64 40 60 C48 56 58 54 62 48 C56 40 46 30 40 22 C36 16 30 12 30 6Z', blobs: [[34, 38, 4.5], [12, 22, 3.5], [24, 52, 2]] },
      attractions: [
        { id: 'oia', name: 'Pôr do sol em Oia', cat: 'mirante', x: 35, y: 10, time: '2 h', price: 'Grátis', desc: 'O pôr do sol mais disputado da Grécia, visto das muralhas do antigo castelo bizantino.' },
        { id: 'redbeach', name: 'Praia Vermelha', cat: 'praia', x: 63, y: 59, time: '2–3 h', price: 'Grátis', desc: 'Falésias de rocha vulcânica vermelha caindo sobre água azul-escura.' },
        { id: 'akrotiri', name: 'Sítio de Akrotiri', cat: 'cultura', x: 50, y: 60, time: '1–2 h', price: '€ 12', desc: 'A “Pompeia do Egeu”: uma cidade da Idade do Bronze preservada sob as cinzas.' },
        { id: 'volcano', name: 'Vulcão Nea Kameni', cat: 'natureza', x: 34, y: 38, time: 'Meio dia', price: '€ 25', boat: true, desc: 'Barco pela caldeira, caminhada até a cratera e banho nas fontes termais.' },
        { id: 'santo', name: 'Vinícolas de Santorini', cat: 'gastronomia', x: 76, y: 46, time: '3 h', price: '€ 40', desc: 'Degustação de Assyrtiko de vinhas em forma de cesto, plantadas rente ao chão por causa do vento.' },
        { id: 'trilha', name: 'Trilha Fira–Oia', cat: 'natureza', x: 58, y: 29, time: '3–4 h', price: 'Grátis', desc: '10 km pela borda da cratera, de Fira até Oia, passando por Imerovigli.' },
      ],
      stays: [
        { id: 'calderablue', name: 'Caldera Blue Suites', type: 'Hotel', x: 52, y: 21, price: 1890, rating: 4.9, reviews: 432, guests: 2, beds: 1, baths: 1, vista: 'sea', palette: 'greek', amen: ['pool', 'breakfast', 'view', 'wifi', 'ac'], rooms: ['view', 'bedroom', 'bath', 'pool', 'facade'], desc: 'Suítes escavadas na rocha da caldeira, com jacuzzi na varanda e café da manhã servido com vista para o vulcão.' },
        { id: 'aegean', name: 'Aegean Cliff Resort', type: 'Resort', x: 42, y: 14, price: 2350, rating: 4.9, reviews: 690, guests: 3, beds: 1, baths: 1, vista: 'sea', palette: 'greek', accent: '#1f5fa8', amen: ['pool', 'spa', 'breakfast', 'view', 'gym', 'wifi'], rooms: ['pool', 'view', 'bedroom', 'living', 'facade'], desc: 'Piscinas em degraus sobre a falésia, spa e o pôr do sol de Oia a 10 minutos de caminhada.' },
        { id: 'cycladic', name: 'Casa Cicládica', type: 'Casa', x: 67, y: 38, price: 1240, rating: 4.8, reviews: 154, guests: 5, beds: 2, baths: 2, vista: 'sea', palette: 'greek', accent: '#3a86d1', amen: ['kitchen', 'view', 'wifi', 'ac', 'pool'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa caiada de branco com terraço, piscina de imersão e cozinha para jantar olhando o mar.' },
      ],
    },
    {
      id: 'amalfi', name: 'Costa Amalfitana', country: 'Itália', region: 'Campânia', tab: 'mundo', scene: 'amalfi',
      sky: ['#f6b98a', '#fde6c4'], days: 8, price: '13.500', best: 'mai–set', currency: 'Euro (€)',
      lang: 'Italiano', tz: '+4 h', flight: '~14 h com conexão',
      tagline: 'Vilas coloridas em cascata, limões enormes e mar turquesa.',
      desc: 'Uma estrada sinuosa costura Positano, Amalfi e Ravello sobre as falésias. Passeios de barco, trilhas no alto da montanha e almoços longos com vista.',
      map: { style: 'sea', km: 0.25, land: 'M0 0 H100 V34 C92 38 86 44 78 42 S64 34 56 40 S42 50 34 46 S18 38 10 44 S2 48 0 46Z', blobs: [[30, 62, 2.2], [90, 58, 1.6]] },
      attractions: [
        { id: 'positano', name: 'Positano e a Spiaggia Grande', cat: 'praia', x: 15, y: 37, time: 'Meio dia', price: 'Grátis', desc: 'Casas em tons pastel descendo a encosta até uma praia de seixos com guarda-sóis listrados.' },
        { id: 'dei', name: 'Trilha dos Deuses', cat: 'natureza', x: 28, y: 18, time: '3–4 h', price: 'Grátis', desc: 'O Sentiero degli Dei: 8 km no alto das falésias, com o mar 600 m abaixo.' },
        { id: 'smeraldo', name: 'Gruta Esmeralda', cat: 'natureza', x: 46, y: 41, time: '1 h', price: '€ 10', desc: 'Caverna marinha onde a luz entra por baixo d’água e deixa tudo verde-esmeralda.' },
        { id: 'duomo', name: 'Catedral de Amalfi', cat: 'cultura', x: 58, y: 33, time: '1 h', price: '€ 4', desc: 'Escadaria monumental, fachada árabe-normanda e o Claustro do Paraíso.' },
        { id: 'ravello', name: 'Villa Rufolo, Ravello', cat: 'mirante', x: 72, y: 20, time: '1–2 h', price: '€ 8', desc: 'Jardins suspensos que inspiraram Wagner, com o terraço mais bonito da costa.' },
        { id: 'limoncello', name: 'Limoeiros e limoncello', cat: 'gastronomia', x: 50, y: 22, time: '2 h', price: '€ 30', desc: 'Visita a um limonal em terraços, com degustação de limoncello e delizia al limone.' },
      ],
      stays: [
        { id: 'limoni', name: 'Albergo Limoni', type: 'Hotel', x: 64, y: 28, price: 1350, rating: 4.7, reviews: 388, guests: 2, beds: 1, baths: 1, vista: 'sea', palette: 'italian', amen: ['breakfast', 'view', 'wifi', 'ac'], rooms: ['facade', 'bedroom', 'bath', 'view', 'living'], desc: 'Hotel familiar com azulejos de Vietri, varandas sobre a praça da catedral e café da manhã no terraço.' },
        { id: 'ravelloterrace', name: 'Ravello Terrace Resort', type: 'Resort', x: 80, y: 14, price: 2100, rating: 4.9, reviews: 512, guests: 3, beds: 1, baths: 1, vista: 'sea', palette: 'italian', accent: '#2f8fb0', amen: ['pool', 'spa', 'breakfast', 'view', 'gym', 'wifi'], rooms: ['pool', 'view', 'bedroom', 'living', 'facade'], desc: 'Um palazzo do século XII com piscina de borda infinita pendurada 350 m acima do mar.' },
        { id: 'azzurra', name: 'Casa Positano Azzurra', type: 'Casa', x: 21, y: 29, price: 1180, rating: 4.8, reviews: 141, guests: 4, beds: 2, baths: 2, vista: 'sea', palette: 'italian', accent: '#3a86d1', amen: ['kitchen', 'view', 'wifi', 'ac'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa de dois andares com terraço de limoeiros, cozinha completa e a praia a 400 degraus de distância.' },
      ],
    },
    {
      id: 'cusco', name: 'Cusco & Machu Picchu', country: 'Peru', region: 'Andes', tab: 'mundo', scene: 'andes',
      sky: ['#9ec3de', '#eef0e4'], days: 7, price: '8.900', best: 'mai–set', currency: 'Sol (S/)',
      lang: 'Espanhol e quíchua', tz: '−2 h', flight: '~7 h com conexão',
      tagline: 'A cidade inca entre nuvens e montanhas de sete cores.',
      desc: 'De Cusco, antiga capital do império inca, um trem cruza o Vale Sagrado até Machu Picchu. Mercados, ruínas de pedra perfeita e montanhas acima dos 5.000 m.',
      map: { style: 'land', km: 1, ground: '#e6e2cf', rivers: ['M0 30 C20 26 34 36 50 30 S80 18 100 24'], hills: [[12, 14, 8], [90, 56, 10], [36, 58, 7], [88, 8, 6]] },
      attractions: [
        { id: 'machupicchu', name: 'Machu Picchu', cat: 'cultura', x: 12, y: 22, time: 'Dia inteiro', price: 'S/ 152', desc: 'A cidadela inca do século XV, encaixada entre os picos de Huayna Picchu e Machu Picchu.' },
        { id: 'valesagrado', name: 'Vale Sagrado e Pisac', cat: 'natureza', x: 54, y: 22, time: 'Dia inteiro', price: 'S/ 70', desc: 'Terraços agrícolas incas, o mercado de artesanato de Pisac e as salinas de Maras.' },
        { id: 'plaza', name: 'Plaza de Armas de Cusco', cat: 'cultura', x: 72, y: 48, time: '3 h', price: 'Grátis', desc: 'Catedral, templo do Qorikancha e ruas de muros incas com casarões coloniais por cima.' },
        { id: 'sanpedro', name: 'Mercado San Pedro', cat: 'gastronomia', x: 63, y: 55, time: '1–2 h', price: 'Livre', desc: 'Sucos, pães de Oropesa, dezenas de tipos de batata e o almoço mais barato da cidade.' },
        { id: 'vinicunca', name: 'Montanha Arco-íris', cat: 'mirante', x: 90, y: 63, time: 'Dia inteiro', price: 'S/ 30', desc: 'Vinicunca, a 5.036 m: faixas minerais vermelhas, verdes e amarelas na encosta.' },
      ],
      stays: [
        { id: 'sanblas', name: 'Casona San Blas', type: 'Hotel', x: 79, y: 43, price: 620, rating: 4.8, reviews: 702, guests: 2, beds: 1, baths: 1, vista: 'city', palette: 'andes', amen: ['breakfast', 'fire', 'wifi', 'parking'], rooms: ['facade', 'bedroom', 'living', 'bath', 'view'], desc: 'Casarão colonial com pátio de pedra, lareira no salão e chá de coca de boas-vindas para a altitude.' },
        { id: 'urubamba', name: 'Urubamba Valley Resort', type: 'Resort', x: 42, y: 26, price: 1380, rating: 4.9, reviews: 450, guests: 3, beds: 1, baths: 1, vista: 'mountain', palette: 'andes', accent: '#5e8a3a', amen: ['pool', 'spa', 'breakfast', 'view', 'wifi', 'parking'], rooms: ['pool', 'facade', 'bedroom', 'living', 'view'], desc: 'Casitas de adobe entre jardins no fundo do vale, 1.000 m mais baixo que Cusco, perto da estação de trem.' },
        { id: 'adobe', name: 'Casa Adobe Pisac', type: 'Casa', x: 60, y: 14, price: 540, rating: 4.7, reviews: 88, guests: 5, beds: 2, baths: 1, vista: 'mountain', palette: 'andes', accent: '#d08a2c', amen: ['kitchen', 'fire', 'wifi', 'parking', 'pet'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa de barro e madeira com lareira, horta e vista para os terraços incas de Pisac.' },
      ],
    },

    /* ================= BRASIL ================= */
    {
      id: 'lencois', name: 'Lençóis Maranhenses', country: 'Brasil', region: 'Maranhão', tab: 'brasil', scene: 'dunes',
      sky: ['#8ec5e6', '#f6d6b8'], days: 6, price: '4.890', best: 'jun–set (lagoas cheias)', currency: 'Real (R$)',
      lang: 'Português', tz: 'Horário de Brasília', flight: '~4 h até São Luís',
      tagline: 'Dunas brancas até o horizonte e lagoas de água doce entre elas.',
      desc: 'Um deserto que não é deserto: a chuva do verão enche centenas de lagoas azuis e verdes entre as dunas. Base em Barreirinhas e noites na vila de Atins.',
      map: { style: 'land', km: 0.4, ground: '#f6eedd', rivers: ['M30 70 C34 50 50 46 60 30 S80 10 100 6'], blobs: [[24, 25, 5], [40, 15, 4], [13, 40, 3], [52, 12, 3], [30, 10, 2.5], [70, 44, 2]] },
      attractions: [
        { id: 'lagoaazul', name: 'Lagoa Azul', cat: 'natureza', x: 24, y: 33, time: 'Meio dia', price: 'R$ 90', desc: 'O circuito clássico: dunas altas e lagoas de água morna e cristalina.' },
        { id: 'lagoabonita', name: 'Lagoa Bonita', cat: 'mirante', x: 40, y: 23, time: 'Meio dia', price: 'R$ 100', desc: 'Subida por uma corda na duna mais alta do parque e pôr do sol sobre as lagoas.' },
        { id: 'atins', name: 'Vila de Atins', cat: 'praia', x: 90, y: 11, time: 'Dia inteiro', price: 'Livre', desc: 'Vila de pescadores com kitesurf, camarão no Canto do Atins e acesso às lagoas mais isoladas.' },
        { id: 'preguicas', name: 'Rio Preguiças e Vassouras', cat: 'natureza', x: 63, y: 29, time: 'Dia inteiro', price: 'R$ 120', boat: true, desc: 'Lancha pelo rio até as dunas de Vassouras, macacos-prego e o farol de Mandacaru.' },
        { id: 'restaurante', name: 'Peixe na orla de Barreirinhas', cat: 'gastronomia', x: 38, y: 58, time: '2 h', price: 'Livre', desc: 'Peixada, arroz de cuxá e juçara gelada nos restaurantes à beira do Preguiças.' },
      ],
      stays: [
        { id: 'dunabranca', name: 'Pousada Duna Branca', type: 'Hotel', x: 31, y: 52, price: 480, rating: 4.7, reviews: 640, guests: 2, beds: 1, baths: 1, vista: 'dunes', palette: 'beach', amen: ['pool', 'breakfast', 'wifi', 'ac', 'parking'], rooms: ['facade', 'bedroom', 'pool', 'bath', 'view'], desc: 'Pousada no centro de Barreirinhas, com piscina no jardim e saída das jardineiras 4x4 na porta.' },
        { id: 'preguicasresort', name: 'Preguiças Eco Resort', type: 'Resort', x: 46, y: 47, price: 980, rating: 4.8, reviews: 512, guests: 3, beds: 1, baths: 1, vista: 'dunes', palette: 'beach', accent: '#3e8463', amen: ['pool', 'spa', 'breakfast', 'view', 'wifi', 'ac'], rooms: ['pool', 'facade', 'bedroom', 'living', 'view'], desc: 'Bangalôs de palha às margens do rio, com redário, caiaques e um deck para o pôr do sol.' },
        { id: 'palha', name: 'Casa de Palha Atins', type: 'Casa', x: 84, y: 16, price: 620, rating: 4.9, reviews: 77, guests: 4, beds: 2, baths: 1, vista: 'dunes', palette: 'beach', accent: '#d2643c', amen: ['kitchen', 'beach', 'wifi', 'pet'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa rústica de palha e madeira pé na areia em Atins, com redes na varanda e vento constante para o kite.' },
      ],
    },
    {
      id: 'noronha', name: 'Fernando de Noronha', country: 'Brasil', region: 'Pernambuco', tab: 'brasil', scene: 'island',
      sky: ['#ffb38a', '#ffd9b3'], days: 5, price: '7.400', best: 'ago–jan (estação seca)', currency: 'Real (R$)',
      lang: 'Português', tz: '+1 h de Brasília', flight: '~1 h a partir de Recife',
      tagline: 'Tartarugas, golfinhos e as praias mais bonitas do país.',
      desc: 'Um arquipélago vulcânico com acesso controlado e mar transparente. Mergulho com tartarugas, mirantes no fim de tarde e a Baía do Sancho, eleita várias vezes a melhor praia do mundo.',
      map: { style: 'sea', km: 0.1, land: 'M8 52 C14 44 26 40 38 36 C52 30 66 22 80 16 C90 12 96 18 90 26 C80 36 64 42 50 48 C36 54 22 60 12 60 C6 60 4 56 8 52Z', blobs: [[95, 9, 1.8], [22, 66, 1.4], [33, 30, 1.6], [37, 29, 1.2]] },
      attractions: [
        { id: 'sancho', name: 'Baía do Sancho', cat: 'praia', x: 42, y: 39, time: 'Meio dia', price: 'Taxa do parque', desc: 'Desce-se por uma escada dentro da rocha até uma praia de água verde e cardumes no raso.' },
        { id: 'porcos', name: 'Baía dos Porcos', cat: 'praia', x: 29, y: 45, time: '2 h', price: 'Taxa do parque', desc: 'Piscinas naturais com o Morro Dois Irmãos de fundo — a vista mais fotografada da ilha.' },
        { id: 'leao', name: 'Praia do Leão', cat: 'natureza', x: 57, y: 42, time: '2 h', price: 'Taxa do parque', desc: 'Praia selvagem do mar de fora e área de desova de tartarugas entre janeiro e junho.' },
        { id: 'golfinhos', name: 'Mirante dos Golfinhos', cat: 'mirante', x: 51, y: 34, time: '1 h', price: 'Taxa do parque', desc: 'Do alto da falésia, centenas de golfinhos-rotadores entram na baía logo cedo.' },
        { id: 'vila', name: 'Vila dos Remédios', cat: 'cultura', x: 77, y: 23, time: '2 h', price: 'Grátis', desc: 'Igrejinha de 1772, ruínas do forte e o Projeto Tamar com palestras à noite.' },
      ],
      stays: [
        { id: 'mardedentro', name: 'Pousada Mar de Dentro', type: 'Hotel', x: 70, y: 28, price: 1450, rating: 4.8, reviews: 288, guests: 2, beds: 1, baths: 1, vista: 'sea', palette: 'beach', accent: '#0f7c8c', amen: ['breakfast', 'pool', 'wifi', 'ac', 'view'], rooms: ['facade', 'bedroom', 'bath', 'pool', 'view'], desc: 'Pousada de oito quartos perto da Vila, com café regional e passeios de barco saindo do porto ao lado.' },
        { id: 'sueste', name: 'Sueste Eco Resort', type: 'Resort', x: 64, y: 37, price: 2600, rating: 4.9, reviews: 340, guests: 3, beds: 1, baths: 1, vista: 'sea', palette: 'beach', accent: '#e4553b', amen: ['pool', 'spa', 'breakfast', 'view', 'beach', 'wifi'], rooms: ['pool', 'view', 'bedroom', 'living', 'facade'], desc: 'Bangalôs de madeira certificada com energia solar, a uma trilha curta da Baía do Sueste e suas tartarugas.' },
        { id: 'boldro', name: 'Casa Boldró', type: 'Casa', x: 46, y: 42, price: 1290, rating: 4.8, reviews: 63, guests: 5, beds: 2, baths: 2, vista: 'sea', palette: 'beach', accent: '#2f8fb0', amen: ['kitchen', 'view', 'wifi', 'ac', 'parking'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa com varanda de frente para o pôr do sol do Boldró, a 5 minutos de buggy do Sancho.' },
      ],
    },
    {
      id: 'serragaucha', name: 'Serra Gaúcha', country: 'Brasil', region: 'Rio Grande do Sul', tab: 'brasil', scene: 'vineyard',
      sky: ['#cfdcd2', '#eef0e2'], days: 4, price: '3.200', best: 'mai–ago · Natal Luz', currency: 'Real (R$)',
      lang: 'Português', tz: 'Horário de Brasília', flight: '~2 h até Porto Alegre',
      tagline: 'Vinícolas, cafés coloniais e neblina da manhã.',
      desc: 'Gramado e Canela parecem cidades europeias de inverno, com lareira e chocolate quente. Ao norte, o Vale dos Vinhedos tem dezenas de vinícolas abertas à visitação.',
      map: { style: 'land', km: 0.8, ground: '#e4e6d2', rivers: ['M0 64 C30 58 60 68 100 58'], blobs: [[25, 46, 2.6]], hills: [[88, 18, 9], [70, 34, 6], [12, 14, 7]] },
      attractions: [
        { id: 'lagonegro', name: 'Lago Negro', cat: 'natureza', x: 24, y: 41, time: '1 h', price: 'Grátis', desc: 'Lago cercado de araucárias e hortênsias, com pedalinhos em forma de cisne.' },
        { id: 'ruacoberta', name: 'Rua Coberta de Gramado', cat: 'gastronomia', x: 35, y: 34, time: '1–2 h', price: 'Livre', desc: 'O coração da cidade, com cafés, fondue e as luzes do Natal Luz.' },
        { id: 'caracol', name: 'Cascata do Caracol', cat: 'mirante', x: 60, y: 56, time: '2 h', price: 'R$ 70', desc: 'Queda d’água de 131 m vista do mirante ou dos 927 degraus até a base.' },
        { id: 'catedral', name: 'Catedral de Pedra, Canela', cat: 'cultura', x: 51, y: 45, time: '1 h', price: 'Grátis', desc: 'Igreja em estilo gótico inglês com torre de 65 m e carrilhão de 12 sinos.' },
        { id: 'vinhedos', name: 'Vale dos Vinhedos', cat: 'gastronomia', x: 90, y: 10, time: 'Dia inteiro', price: 'R$ 80', desc: 'Vinícolas com degustação, espumantes premiados e almoço italiano de seis pratos.' },
      ],
      stays: [
        { id: 'pinheiro', name: 'Hotel Pinheiro Alto', type: 'Hotel', x: 31, y: 27, price: 690, rating: 4.7, reviews: 920, guests: 2, beds: 1, baths: 1, vista: 'hills', palette: 'mountain', amen: ['fire', 'breakfast', 'wifi', 'parking', 'gym'], rooms: ['facade', 'bedroom', 'living', 'bath', 'view'], desc: 'Hotel em estilo enxaimel a três quadras da Rua Coberta, com lareira em todos os quartos.' },
        { id: 'vinhedoresort', name: 'Vinhedo Serrano Resort', type: 'Resort', x: 82, y: 18, price: 1520, rating: 4.9, reviews: 610, guests: 3, beds: 1, baths: 1, vista: 'hills', palette: 'mountain', accent: '#7a2a3a', amen: ['pool', 'spa', 'breakfast', 'view', 'wifi', 'parking'], rooms: ['view', 'facade', 'bedroom', 'pool', 'living'], desc: 'Resort no meio das parreiras com piscina aquecida, spa de vinoterapia e adega própria.' },
        { id: 'hortensias', name: 'Chalé das Hortênsias', type: 'Casa', x: 43, y: 53, price: 760, rating: 4.9, reviews: 154, guests: 4, beds: 2, baths: 1, vista: 'hills', palette: 'mountain', accent: '#6b7fb8', amen: ['fire', 'kitchen', 'wifi', 'parking', 'pet'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Chalé de madeira entre Gramado e Canela, com lareira, ofurô na varanda e café colonial entregue na porta.' },
      ],
    },
    {
      id: 'jalapao', name: 'Jalapão', country: 'Brasil', region: 'Tocantins', tab: 'brasil', scene: 'night',
      sky: ['#140f2e', '#3b2a63'], roomSky: ['#f2a65e', '#f8d9a0'], days: 6, price: '4.300', best: 'mai–set', currency: 'Real (R$)',
      lang: 'Português', tz: 'Horário de Brasília', flight: '~2 h até Palmas',
      tagline: 'Fervedouros, dunas alaranjadas e um céu sem nenhuma luz por perto.',
      desc: 'Um sertão de cerrado, rios cristalinos e capim dourado. As distâncias são longas e de estrada de terra: o ideal é ir de 4x4 com guia local.',
      map: { style: 'land', km: 1.4, ground: '#ecdab8', rivers: ['M0 14 C30 20 60 10 100 18', 'M40 70 C44 56 52 48 66 40'], hills: [[67, 33, 7], [18, 60, 6], [88, 50, 5]] },
      attractions: [
        { id: 'fervedouro', name: 'Fervedouros', cat: 'natureza', x: 28, y: 27, time: 'Meio dia', price: 'R$ 30', desc: 'Nascentes com água tão pressionada que é impossível afundar: você flutua sobre a areia.' },
        { id: 'dunas', name: 'Dunas do Jalapão', cat: 'mirante', x: 58, y: 46, time: '2–3 h', price: 'R$ 20', desc: 'Dunas cor de laranja de até 40 m ao pé da Serra do Espírito Santo, no fim da tarde.' },
        { id: 'velha', name: 'Cachoeira da Velha', cat: 'natureza', x: 88, y: 23, time: '2 h', price: 'R$ 30', desc: 'Uma ferradura de 100 m de largura no Rio Novo, a maior queda do parque.' },
        { id: 'pedrafurada', name: 'Pedra Furada', cat: 'mirante', x: 44, y: 61, time: '1 h', price: 'R$ 20', desc: 'Arco de arenito que emoldura o pôr do sol no meio do cerrado.' },
        { id: 'mumbuca', name: 'Comunidade Mumbuca', cat: 'cultura', x: 36, y: 40, time: '2 h', price: 'Livre', desc: 'Artesãs quilombolas que transformam o capim dourado em bolsas, joias e mandalas.' },
      ],
      stays: [
        { id: 'capimdourado', name: 'Pousada Capim Dourado', type: 'Hotel', x: 38, y: 22, price: 520, rating: 4.7, reviews: 233, guests: 2, beds: 1, baths: 1, vista: 'hills', palette: 'cerrado', amen: ['breakfast', 'wifi', 'ac', 'parking'], rooms: ['facade', 'bedroom', 'bath', 'living', 'view'], desc: 'Pousada simples e caprichada em Mateiros, ponto de partida dos passeios, com café regional e rede na varanda.' },
        { id: 'glamping', name: 'Cerrado Glamping Resort', type: 'Resort', x: 55, y: 54, price: 1180, rating: 4.9, reviews: 187, guests: 2, beds: 1, baths: 1, vista: 'dunes', palette: 'cerrado', accent: '#3b2a63', amen: ['pool', 'breakfast', 'view', 'spa', 'parking'], rooms: ['facade', 'bedroom', 'pool', 'view', 'living'], desc: 'Tendas de lona com cama king, banheiro privativo e teto que abre para ver a Via Láctea.' },
        { id: 'adobejalapao', name: 'Casa de Adobe Mateiros', type: 'Casa', x: 22, y: 37, price: 450, rating: 4.8, reviews: 59, guests: 6, beds: 3, baths: 2, vista: 'hills', palette: 'cerrado', accent: '#4f7a45', amen: ['kitchen', 'parking', 'wifi', 'pet'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa de adobe com quintal de cerrado, ideal para grupos que vão de 4x4 e querem cozinhar.' },
      ],
    },
    {
      id: 'chapada', name: 'Chapada Diamantina', country: 'Brasil', region: 'Bahia', tab: 'brasil', scene: 'mesas',
      sky: ['#f08a4b', '#f7c27a'], days: 7, price: '3.950', best: 'abr–out', currency: 'Real (R$)',
      lang: 'Português', tz: 'Horário de Brasília', flight: '~2 h até Salvador',
      tagline: 'Morros de topo reto, cachoeiras e poços azuis.',
      desc: 'Antiga terra de garimpo de diamantes, hoje é a capital do trekking no Brasil: grutas com água azul, cachoeiras de 300 m e vales sem estrada.',
      map: { style: 'land', km: 0.9, ground: '#ebdfc6', rivers: ['M0 44 C20 40 30 50 50 46 S80 52 100 40'], hills: [[40, 30, 7], [82, 64, 8], [14, 12, 6]] },
      attractions: [
        { id: 'paiinacio', name: 'Morro do Pai Inácio', cat: 'mirante', x: 41, y: 31, time: '2 h', price: 'R$ 10', desc: 'Subida curta até o topo plano, com o pôr do sol mais famoso da Chapada.' },
        { id: 'fumaca', name: 'Cachoeira da Fumaça', cat: 'natureza', x: 63, y: 58, time: 'Dia inteiro', price: 'Grátis', desc: 'Queda de 340 m que vira névoa antes de tocar o chão. Você deita na borda para olhar.' },
        { id: 'pocoazul', name: 'Poço Azul', cat: 'natureza', x: 16, y: 58, time: '2 h', price: 'R$ 30', desc: 'Gruta inundada onde, de abril a setembro, um raio de sol acende a água de azul.' },
        { id: 'lapadoce', name: 'Gruta da Lapa Doce', cat: 'natureza', x: 25, y: 14, time: '2 h', price: 'R$ 40', desc: 'Galerias de 850 m com estalactites gigantes, percorridas com lanterna e guia.' },
        { id: 'pati', name: 'Vale do Pati', cat: 'natureza', x: 86, y: 61, time: '3–5 dias', price: 'Com guia', desc: 'Travessia sem estrada, dormindo na casa de moradores do vale.' },
        { id: 'lencoistown', name: 'Centro histórico de Lençóis', cat: 'cultura', x: 59, y: 22, time: '2 h', price: 'Grátis', desc: 'Casarões coloridos do ciclo do diamante, restaurantes e forró à noite.' },
      ],
      stays: [
        { id: 'garimpo', name: 'Pousada Garimpo Velho', type: 'Hotel', x: 64, y: 28, price: 420, rating: 4.7, reviews: 530, guests: 2, beds: 1, baths: 1, vista: 'mesa', palette: 'cerrado', accent: '#2f8fb0', amen: ['pool', 'breakfast', 'wifi', 'parking'], rooms: ['facade', 'bedroom', 'pool', 'bath', 'view'], desc: 'Casarão de 1850 restaurado no centro de Lençóis, com piscina no quintal e guias que saem da recepção.' },
        { id: 'pratinha', name: 'Pratinha Eco Resort', type: 'Resort', x: 30, y: 22, price: 980, rating: 4.8, reviews: 316, guests: 3, beds: 1, baths: 1, vista: 'mesa', palette: 'cerrado', accent: '#3e8463', amen: ['pool', 'spa', 'breakfast', 'view', 'wifi', 'parking'], rooms: ['pool', 'facade', 'bedroom', 'living', 'view'], desc: 'Chalés entre o cerrado e o rio, a poucos minutos da Gruta Azul e da Lapa Doce.' },
        { id: 'pedras', name: 'Casa das Pedras, Capão', type: 'Casa', x: 55, y: 49, price: 380, rating: 4.9, reviews: 102, guests: 4, beds: 2, baths: 1, vista: 'mesa', palette: 'cerrado', accent: '#6b4fa0', amen: ['kitchen', 'fire', 'wifi', 'pet', 'parking'], rooms: ['facade', 'living', 'kitchen', 'bedroom', 'view'], desc: 'Casa de pedra no Vale do Capão, com lareira, horta e a trilha da Fumaça começando na rua de trás.' },
      ],
    },
  ];

  /* ---------- Pacotes ----------
     air = aeroporto de chegada (base = preço da passagem ida e volta saindo de São Paulo, só nos internacionais;
     nos nacionais o preço é calculado pela distância). tags = temas do pacote. note = como é o traslado. */
  const TRAVEL = {
    kyoto: { air: { code: 'KIX', city: 'Osaka', lat: 34.43, lon: 135.23, base: 6900 }, tags: ['Cultura', 'Lua de mel', 'Gastronomia'], note: 'Trem expresso do aeroporto de Kansai até Kyoto (75 min).' },
    krabi: { air: { code: 'KBV', city: 'Krabi', lat: 8.10, lon: 98.98, base: 6200 }, tags: ['Praia', 'Lua de mel', 'Aventura'], note: 'Transfer do aeroporto de Krabi até Ao Nang (30 min).' },
    santorini: { air: { code: 'JTR', city: 'Santorini', lat: 36.40, lon: 25.48, base: 5200 }, tags: ['Lua de mel', 'Praia', 'Gastronomia'], note: 'Transfer do aeroporto até o hotel na caldeira (20 min).' },
    amalfi: { air: { code: 'NAP', city: 'Nápoles', lat: 40.88, lon: 14.29, base: 4700 }, tags: ['Lua de mel', 'Gastronomia', 'Praia'], note: 'Transfer privativo de Nápoles até a costa (1h30).' },
    cusco: { air: { code: 'CUZ', city: 'Cusco', lat: -13.54, lon: -71.94, base: 2600 }, tags: ['Aventura', 'Cultura'], note: 'Trem panorâmico até Machu Picchu incluído no passeio.' },
    lencois: { air: { code: 'SLZ', city: 'São Luís', lat: -2.58, lon: -44.24 }, tags: ['Natureza', 'Aventura', 'Família'], note: 'Transfer de São Luís até Barreirinhas (4 h).' },
    noronha: { air: { code: 'FEN', city: 'Noronha', lat: -3.85, lon: -32.42, mult: 1.45 }, tags: ['Praia', 'Natureza', 'Lua de mel'], note: 'Transfer do aeroporto até a pousada (10 min).', fee: { label: 'Taxa de preservação', perDay: 101 } },
    serragaucha: { air: { code: 'POA', city: 'Porto Alegre', lat: -29.99, lon: -51.17 }, tags: ['Gastronomia', 'Família', 'Lua de mel'], note: 'Transfer de Porto Alegre até Gramado (2 h).' },
    jalapao: { air: { code: 'PMW', city: 'Palmas', lat: -10.29, lon: -48.36 }, tags: ['Aventura', 'Natureza'], note: 'Expedição em 4x4 com motorista-guia a partir de Palmas.' },
    chapada: { air: { code: 'SSA', city: 'Salvador', lat: -12.91, lon: -38.33 }, tags: ['Aventura', 'Natureza', 'Família'], note: 'Transfer de Salvador até Lençóis (6 h).' },
  };
  // cidades de onde o cliente pode sair
  const ORIGINS = [
    { code: 'GRU', city: 'São Paulo', lat: -23.43, lon: -46.47 },
    { code: 'GIG', city: 'Rio de Janeiro', lat: -22.81, lon: -43.25 },
    { code: 'CNF', city: 'Belo Horizonte', lat: -19.63, lon: -43.97 },
    { code: 'BSB', city: 'Brasília', lat: -15.87, lon: -47.92 },
    { code: 'SSA', city: 'Salvador', lat: -12.91, lon: -38.33 },
    { code: 'REC', city: 'Recife', lat: -8.13, lon: -34.92 },
    { code: 'FOR', city: 'Fortaleza', lat: -3.78, lon: -38.53 },
    { code: 'CWB', city: 'Curitiba', lat: -25.53, lon: -49.18 },
    { code: 'POA', city: 'Porto Alegre', lat: -29.99, lon: -51.17 },
  ];

  // Liga cada estadia/atração ao destino e resolve a paleta dos interiores
  DESTS.forEach((d, i) => {
    d.index = i;
    Object.assign(d, TRAVEL[d.id]);
    d.attractions.forEach(a => { a.dest = d; });
    d.stays.forEach(s => {
      s.dest = d;
      s.pal = Object.assign({}, PAL[s.palette], s.accent ? { accent: s.accent } : {});
    });
  });

  const QUOTES = [
    { q: 'Ficamos numa casa a poucos minutos da lagoa e fizemos quase tudo a pé. O roteiro já veio com o melhor horário de cada passeio.', who: 'Marina e Diego', where: 'Lençóis Maranhenses' },
    { q: 'Eu nunca teria achado aquele ryokan sozinha. Ver o quarto por dentro e a distância até Gion me fez reservar na hora.', who: 'Patrícia', where: 'Kyoto, Japão' },
    { q: 'O mapa com a distância até cada praia mudou o jeito como eu escolho hospedagem. Parece óbvio, mas ninguém mostra isso.', who: 'Rafael', where: 'Fernando de Noronha' },
  ];

  const EXPERIENCES = [
    { cat: 'praia', title: 'Praias', scene: 'island', text: 'Areia branca, água transparente e pôr do sol com o pé na areia.' },
    { cat: 'cultura', title: 'Cultura', scene: 'kyoto', text: 'Templos, ruínas, vilas históricas e tradições vivas.' },
    { cat: 'natureza', title: 'Natureza', scene: 'mesas', text: 'Cachoeiras, trilhas, dunas e grutas para explorar com guia local.' },
    { cat: 'gastronomia', title: 'Gastronomia', scene: 'vineyard', text: 'Mercados, vinícolas e a comida de rua que vale a viagem.' },
    { cat: 'mirante', title: 'Mirantes', scene: 'santorini', text: 'Os lugares mais altos e os pores do sol mais bonitos.' },
  ];

  return { CATS, TYPES, AMEN, PAL, DESTS, QUOTES, EXPERIENCES, ORIGINS };
})();
