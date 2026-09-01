/* =====================================================================
   Brisa e Lamentações - Livro do Jogador
   Módulo: js/data.js
   Dados base + mecânicas + reações (conteúdo original do livro).
   Carregado antes de app.js.
   ===================================================================== */

/* ---------------------------------------------------------------------
   DADOS BASE - extraídos do livro "Brisa e Lamentações"
   --------------------------------------------------------------------- */
const DEFAULT_DATA = {
  races: [
    {id:"r1",name:"Humanos",bonus:"+1 em um atributo à escolha",appearance:"1,60m–1,90m · vida útil até 100 anos",identity:"Não têm conexão profunda com o Astral; sua força está na adaptabilidade e na versatilidade.",traits:[
      {name:"Determinação",desc:"Uma vez por sessão, perca 1 Lucidez para rolar novamente um dos Duality Dice."},
      {name:"Aprendizado Versátil",desc:"Na criação, escolha uma Experience adicional além das concedidas pela Classe."},
      {name:"Estabilidade Mundana",desc:"Na primeira Perda Catastrófica de Lucidez da sessão, pode perder 2 Lucidez adicionais para reduzir a gravidade do Trauma resultante em um nível."}
    ]},
    {id:"r2",name:"Elfos",bonus:"+1 Agilidade ou Precisão",appearance:"1,60m–1,75m · milênios de vida",identity:"Conexão intensa com magia e cosmos; graciosos, longevos e alheios às preocupações mundanas.",traits:[
      {name:"Visão Élfica",desc:"Enxergam normalmente em ambientes com pouca luz, tratando escuridão parcial como iluminação plena."},
      {name:"Transe Astral",desc:"Não dormem: entram em meditação profunda por algumas horas, cumprindo a função de um descanso longo."},
      {name:"Eco Astral",desc:"Uma vez por descanso longo, podem negar uma perda de Lucidez causada por Outrem, perdendo 1 Lucidez no lugar."}
    ]},
    {id:"r3",name:"Anões",bonus:"+1 Força",appearance:"1,20m–1,40m · até ~500 anos (maldição)",identity:"Dominam as montanhas; força física e domínio sobre metais compensam a baixa estatura.",traits:[
      {name:"Visão no Escuro",desc:"Enxergam normalmente em pouca ou nenhuma luz."},
      {name:"Sangue de Pedra",desc:"Resistência natural a venenos e toxinas: um nível a menos de severidade."},
      {name:"Mente de Pedra",desc:"Uma vez por descanso curto, podem negar perda de Lucidez causada por Acontecimentos ou Outrem (não Substâncias), perdendo 1 Lucidez no lugar."}
    ]},
    {id:"r4",name:"Gnomos",bonus:"+1 Inteligência",appearance:"1,0m–1,20m · 6 a 7 séculos",identity:"Lideram o desenvolvimento tecnológico, unindo domínio da natureza a criatividade mecânica.",traits:[
      {name:"Visão no Escuro",desc:"Enxergam normalmente em pouca ou nenhuma luz."},
      {name:"Esperteza Gnômica",desc:"Vantagem em testes de resistência contra efeitos mágicos de controle ou leitura mental."},
      {name:"Engenhoca de Bolso",desc:"Uma vez por descanso curto, perca 1 Lucidez para que uma invenção pessoal resolva um pequeno problema prático."}
    ]},
    {id:"r5",name:"Orcs",bonus:"+1 Força",appearance:"2,0m–3,0m · 1 a 3 séculos",identity:"Vivem no âmbito da guerra; força lendária e resistência à dor quase sobrenatural.",traits:[
      {name:"Visão no Escuro",desc:"Enxergam normalmente em pouca ou nenhuma luz."},
      {name:"Vigor Inabalável",desc:"Uma vez por descanso longo, ao chegar a 0 de Vida por um golpe não letal imediato, permanece de pé com 1 Vida."},
      {name:"Endurecido pela Guerra",desc:"Uma vez por cena de combate, pode negar perda de Lucidez causada por Acontecimento ocorrido no próprio combate, perdendo 1 Lucidez no lugar."}
    ]},
    {id:"r6",name:"Draconianos",bonus:"+1 Presença",appearance:"1,50m–1,90m · 1 a 3 séculos",identity:"Descendentes distantes dos dragões; escamas, presença imponente e sopro elemental latente.",traits:[
      {name:"Ancestral Dracônico",desc:"Escolha um elemento (fogo, gelo, raio, ácido ou veneno) na criação: resistência a esse tipo de dano."},
      {name:"Sopro Elemental",desc:"Uma vez por descanso longo, expele uma rajada do elemento escolhido, dano equivalente ao de uma arma do seu Tier."},
      {name:"Hipersensibilidade Sensorial",desc:"Não pode ser pego de surpresa por ataques de curto alcance, exceto fontes sobrenaturais ou muito furtivas."}
    ]},
    {id:"r7",name:"Tieflings",bonus:"+1 Presença",appearance:"1,50m–1,90m · até 7 séculos",identity:"Carregam legado de linhagem infernal distante; mente afiada e presença magnética.",traits:[
      {name:"Visão no Escuro e Resistência Infernal",desc:"Enxergam no escuro e possuem resistência a dano de fogo."},
      {name:"Legado Inféro",desc:"Escolha uma linhagem infernal (Abissal, Ctônica, Infernal): um truque menor sempre disponível, sem custo de Mana."},
      {name:"Marcados",desc:"Uma vez por descanso longo, podem negar perda de Lucidez causada por rejeição/humilhação social/desprezo alheio, perdendo 1 Lucidez no lugar."}
    ]},
    {id:"r8",name:"Katari",bonus:"+1 Agilidade ou Precisão",appearance:"1,30m–1,70m · até 80 anos",identity:"Humanoides felinos entre a civilização e a natureza indomada; curiosos por natureza.",traits:[
      {name:"Garras Naturais",desc:"Garras retráteis funcionam como arma natural leve cortante, sempre 'equipada'."},
      {name:"Velocidade Felina",desc:"Uma vez por descanso curto, dobra a velocidade de movimento por um turno, ignorando terreno difícil."},
      {name:"Curiosidade Voraz",desc:"Vantagem para obter informações sobre objetos, relíquias, livros ou boatos (mas mais vulneráveis a se arriscar por vontade própria)."}
    ]},
    {id:"r9",name:"Wishborn",bonus:"+1 Instinto",appearance:"variável · vida útil desconhecida",identity:"Nascidos de um desejo concedido por um Djinn; cada um é único, herdando traços de quem pediu e do Djinn.",traits:[
      {name:"Eco do Desejo",desc:"Escolha uma raça existente na criação; ganha um dos Traços Marcantes dela, sujeito à aprovação do Mestre."},
      {name:"Sombra do Djinn",desc:"Presença sutilmente sobrenatural: animais reagem de forma incomum, certos rituais os detectam como 'não totalmente mortais'."},
      {name:"Existência Instável",desc:"Perdas de Lucidez causadas por Outrem são sempre tratadas um grau de severidade acima do normal."}
    ]},
    {id:"r10",name:"Clank",bonus:"+1 à escolha (definido na criação)",appearance:"variável · vida útil indefinida (depende de manutenção)",identity:"Seres construídos de metal e núcleos mágicos, animados por um propósito.",traits:[
      {name:"Design Propositado",desc:"Na criação, escolha um segundo atributo para receber +1."},
      {name:"Reparo Eficiente",desc:"Durante um descanso, recupera uma quantidade adicional de Vida além do normal."},
      {name:"Imunidade Biológica",desc:"Imune a venenos, doenças e efeitos que dependam de biologia viva."}
    ]},
    {id:"r11",name:"Faerie",bonus:"+1 Agilidade ou Precisão",appearance:"0,60m–0,90m · séculos de vida",identity:"Pequenos seres feéricos com asas delicadas e conexão profunda com sorte e acaso.",traits:[
      {name:"Voo Curto",desc:"Voa curtas distâncias - atravessa obstáculos pequenos, plana uma queda ou alcança lugares elevados."},
      {name:"Sortudo",desc:"Uma vez por sessão, força a repetição de um dos Duality Dice numa rolagem própria."},
      {name:"Fragilidade Feérica",desc:"Ataques físicos severos contra um Faerie são tratados um grau de severidade acima do normal."}
    ]},
    {id:"r12",name:"Fauno",bonus:"+1 Agilidade ou Precisão",appearance:"1,50m–1,80m · até 100 anos",identity:"Pernas caprinas e conexão instintiva com a natureza selvagem; ágeis e teimosos.",traits:[
      {name:"Salto Caprino",desc:"Salta distâncias e alturas maiores que a média, sem necessidade de teste em situações razoáveis."},
      {name:"Chifres",desc:"Ataque natural de investida com os chifres, útil ao correr antes do golpe."},
      {name:"Espírito Indomável",desc:"Vantagem em testes de resistência contra controle, comando ou dominação da vontade."}
    ]},
    {id:"r13",name:"Firbolg",bonus:"+1 Presença",appearance:"2,10m–2,50m · séculos de vida",identity:"Gigantes gentis, profundamente conectados à empatia; preferem diplomacia à violência.",traits:[
      {name:"Investida",desc:"Ao se mover em linha reta antes de atacar, o golpe seguinte causa dano adicional."},
      {name:"Inabalável",desc:"Uma vez por descanso curto, ao sofrer dano físico que marcaria Vida, reduz a marcação em 1 ponto, perdendo 1 Lucidez no lugar."},
      {name:"Empatia Silenciosa",desc:"Percebe com clareza o estado emocional genuíno de quem está por perto, mesmo escondido."}
    ]},
    {id:"r14",name:"Fungril",bonus:"+1 Inteligência",appearance:"1,20m–1,60m · vida útil indefinida (rede continua)",identity:"Seres fúngicos que compartilham uma rede de consciência subterrânea.",traits:[
      {name:"Rede Fúngica",desc:"Comunica-se de forma limitada com outros Fungril via esporos, mesmo sem contato visual."},
      {name:"Conexão com a Morte",desc:"Extrai impressões residuais de corpos recém-falecidos via esporos, obtendo fragmentos de informação."},
      {name:"Corpo Modular",desc:"Parte do corpo pode regenerar de ferimentos permanentes em outras raças, a critério do Mestre."}
    ]},
    {id:"r15",name:"Galapa",bonus:"+1 Instinto",appearance:"1,40m–1,70m · séculos de vida",identity:"Humanoides com carapaças protetoras; lentos, mas quase impossíveis de derrubar.",traits:[
      {name:"Concha",desc:"Armor Score adicional natural, mesmo sem armadura equipada."},
      {name:"Recolher-se",desc:"Como Reação, recolhe-se na carapaça: proteção substancial contra um ataque, mas perde a ação no próprio próximo turno."},
      {name:"Passo Firme",desc:"Dificilmente é derrubado ou deslocado à força contra sua vontade."}
    ]},
    {id:"r16",name:"Gigante",bonus:"+1 Força",appearance:"2,50m–3,50m · até 200 anos",identity:"A maior das raças mortais; força capaz de moldar o próprio terreno.",traits:[
      {name:"Resistência",desc:"Vida adicional em relação às outras raças."},
      {name:"Alcance",desc:"Alcance adicional em ataques corpo a corpo e para alcançar objetos distantes."},
      {name:"Passos Pesados",desc:"Inimigos próximos sofrem desvantagem para se esgueirar despercebidos por um Gigante."}
    ]},
    {id:"r17",name:"Goblin",bonus:"+1 Instinto",appearance:"1,00m–1,30m · até 60 anos",identity:"Pequenos, espertos e rápidos; sobrevivem pela astúcia e trabalho em equipe.",traits:[
      {name:"Passo Seguro",desc:"Ignora terrenos instáveis/escorregadios sem penalidade; sem desvantagem em espaços apertados."},
      {name:"Sentido de Perigo",desc:"Uma vez por cena, age com vantagem ao tentar evitar ser surpreendido."},
      {name:"Sortudo em Grupo",desc:"Lutando ao lado de ao menos um aliado, recebe pequenas vantagens situacionais adicionais."}
    ]},
    {id:"r18",name:"Halfling",bonus:"+1 Agilidade ou Precisão",appearance:"0,90m–1,20m · até 150 anos",identity:"Pequenos, discretos e surpreendentemente resilientes diante do perigo.",traits:[
      {name:"Sorte",desc:"Uma vez por sessão, transforma um resultado de Fear prevalecente em Hope prevalecente numa rolagem própria."},
      {name:"Bússola Interior",desc:"Nunca fica genuinamente perdido: sempre tem noção aproximada de direção e posição."},
      {name:"Discrição Natural",desc:"Mais fácil passar despercebido em ambientes movimentados ou multidões."}
    ]},
    {id:"r19",name:"Ribbet",bonus:"+1 Instinto",appearance:"1,20m–1,60m · até 80 anos",identity:"Humanoides anfíbios, à vontade tanto na terra quanto na água.",traits:[
      {name:"Anfíbio",desc:"Respira no ar e debaixo d'água, nada com a mesma facilidade com que caminha."},
      {name:"Língua Longa",desc:"Usa a própria língua para puxar pequenos objetos ou se agarrar a superfícies próximas à distância."},
      {name:"Salto Potente",desc:"Salta distâncias notavelmente maiores que a média, especialmente na horizontal."}
    ]},
    {id:"r20",name:"Simiah",bonus:"+1 Agilidade ou Precisão",appearance:"1,50m–1,80m · até 80 anos",identity:"Humanoides primatas, ágeis, sociáveis e extremamente adaptáveis.",traits:[
      {name:"Escalador Nato",desc:"Escala superfícies com a mesma facilidade de caminhar em terreno plano, sem teste em situações razoáveis."},
      {name:"Equilíbrio Natural",desc:"Dificilmente perde o equilíbrio em superfícies instáveis, estreitas ou em movimento."},
      {name:"Cauda Preênsil (opcional)",desc:"A critério do Mestre, alguns Simiah têm cauda preênsil capaz de segurar objetos leves ou ajudar em escaladas."}
    ]}
  ],

  classes: [
    {id:"c1",name:"Mago",type:"Mágica",resource:"Mana",resourceMax:115,lucidityMax:100,attrs:"Inteligência e Instinto",
     identity:"O estudioso da magia. Enquanto o Feiticeiro sente a Mana, o Mago entende sua estrutura - círculos mágicos, encantamentos, ferramentas e conhecimento teórico.",
     features:[{name:"Padrões Arcanos",desc:"Identifica padrões na realidade; certos resultados dos Duality Dice concedem benefícios."},{name:"Preparação",desc:"Prepara um conjunto de magias e técnicas para a aventura, ajustável em períodos apropriados."}],
     impulse:{name:"Domínio Arcano",desc:"Gasta Mana para modificar uma magia preparada, ampliar seu efeito ou realizar uma conjuração extraordinária."},
     paths:[{name:"Conhecimento",focus:"Estudo, preparação e domínio teórico",areas:"Círculos, Grimórios, Identificação, Preparação, Memória Perfeita"},
            {name:"Guerra Arcana",focus:"Aplicação prática da magia em combate",areas:"Escudos, Evocação, Ataques, Conjuração Rápida, Destruição Arcana"}]},
    {id:"c2",name:"Feiticeiro",type:"Mágica",resource:"Mana",resourceMax:110,lucidityMax:100,attrs:"Presença e Instinto",
     identity:"Poder que é uma característica da própria existência - uma conexão espontânea e profunda com a Mana, sem aprendizado formal como o Mago.",
     features:[{name:"Magia Instintiva",desc:"Modifica ou adapta magias através da própria Mana: alcance, dano, velocidade, área ou combinação de efeitos, com custo."}],
     impulse:{name:"Sobrecarga",desc:"Ultrapassa deliberadamente os limites da própria Mana; a magia é amplificada, mas pode consumir Mana adicional ou Lucidez."},
     paths:[{name:"Linhagem",focus:"O poder vem de uma origem específica",areas:"Dracônica, Celestial, Abissal, Elemental, Astral"},
            {name:"Tempestade",focus:"Transforma a própria Mana em energia destrutiva e instável",areas:"Elementos, Descargas, Explosões, Sobrecarga, Cataclismo"}]},
    {id:"c3",name:"Serafim",type:"Mágica",resource:"Mana",resourceMax:100,lucidityMax:100,attrs:"Presença, Força e Instinto",
     identity:"Combatente espiritual que canaliza uma força superior através da própria alma - fé, propósito ou vínculo espiritual.",
     features:[{name:"Dados de Oração",desc:"Alteram resultados, protegem aliados, reduzem dano ou aumentam efeitos de cura."}],
     impulse:{name:"Suporte Vital",desc:"Canaliza Mana para impedir que um aliado caia, recuperando recursos ou impedindo temporariamente uma consequência grave."},
     paths:[{name:"Devoção",focus:"Fé, proteção e suporte",areas:"Orações, Cura, Proteção, Bênçãos, Milagre"},
            {name:"Guerreiro Celestial",focus:"Combate e poder espiritual",areas:"Arma Sagrada, Golpes Radiantes, Armadura Espiritual, Julgamento, Avatar Celestial"}]},
    {id:"c4",name:"Druida",type:"Mágica",resource:"Mana",resourceMax:90,lucidityMax:100,attrs:"Instinto, Presença e Força",
     identity:"Conexão profunda com a natureza e as formas vivas do mundo; capacidade de alterar o próprio corpo e utilizar forças naturais.",
     features:[{name:"Forma Selvagem",desc:"Transforma o corpo em diferentes formas naturais, cada uma com Vida, capacidades, ataques e movimentação próprios."},{name:"Toque Natural",desc:"Sente alterações ambientais, manipula plantas, identifica criaturas."}],
     impulse:{name:"Evolução",desc:"Força a transformação além do limite normal, gastando Mana para melhorar temporariamente a forma selvagem atual."},
     paths:[{name:"Forma Primordial",focus:"Transformação e combate",areas:"Predadores, Grandes Feras, Criaturas Aquáticas, Criaturas Aéreas, Forma Primordial"},
            {name:"Guardião Natural",focus:"Magia natural e suporte",areas:"Plantas, Cura, Espíritos, Elementos, Avatar da Natureza"}]},
    {id:"c5",name:"Bardo",type:"Mágica",resource:"Mana",resourceMax:85,lucidityMax:100,attrs:"Presença, Agilidade/Precisão ou Inteligência",
     identity:"Transforma expressão, presença e emoção em poder - a força está na capacidade de alterar o estado das pessoas ao redor.",
     features:[{name:"Inspiração",desc:"Concede Dados de Inspiração a aliados, usáveis em rolagens, reações, dano ou para recuperar Lucidez."}],
     impulse:{name:"Fazer uma Cena",desc:"Gasta muita Mana para alterar imediatamente o ritmo da cena - distrair, fortalecer, ou transformar uma falha social em oportunidade."},
     paths:[{name:"Trovador",focus:"Música e fortalecimento do grupo",areas:"Canções de Recuperação, Canções de Guerra, Canções de Inspiração, Melodias Emocionais, Harmonia Suprema"},
            {name:"Orador",focus:"Palavras, influência e manipulação",areas:"Discursos, Persuasão, Intimidação, Encantamento, Manipulação Mental"}]},
    {id:"c6",name:"Monge",type:"Física",resource:"Prana",resourceMax:35,lucidityMax:80,attrs:"Agilidade/Precisão, Presença e Instinto",
     identity:"A classe física mais espiritual: canaliza o Prana pela disciplina interior e o equilíbrio entre corpo e espírito.",
     features:[{name:"Fluxo Interior",desc:"Acumula e circula Prana internamente, encadeando golpes desarmados; cada golpe conectado potencializa o próximo."},{name:"Equilíbrio Interior",desc:"Recuperação de Lucidez mais eficiente durante descanso; pode meditar uma vez por sessão para recuperar Lucidez extra."}],
     impulse:{name:"Vazio Interior",desc:"Concentra todo o Prana em um golpe de precisão absoluta, ignorando parte da proteção do alvo."},
     paths:[{name:"Punho de Ferro",focus:"Combate desarmado ofensivo",areas:"Golpes Sequenciais, Pontos Vitais, Quebra de Guarda, Fúria Contida, Punho Transcendente"},
            {name:"Vazio",focus:"Disciplina interior, meditação e defesa espiritual",areas:"Meditação, Desvio, Serenidade, Corpo Diáfano, Iluminação"}]},
    {id:"c7",name:"Samurai",type:"Física",resource:"Prana",resourceMax:30,lucidityMax:80,attrs:"Agilidade/Precisão, Instinto e Presença",
     identity:"Classe exclusiva do sistema: disciplina marcial, precisão, controle emocional e domínio da lâmina. Não pertence aos Caminhos do Guerreiro.",
     features:[{name:"Posturas",desc:"Água (defesa/reação), Fogo (ofensiva/pressão), Vento (mobilidade/velocidade) e Montanha (resistência/estabilidade)."},{name:"Disciplina",desc:"Habilidades que permitem resistir a efeitos mentais, negar perdas, recuperar Prana ou transformar Lucidez em potência temporária."}],
     impulse:{name:"Corte Absoluto",desc:"Concentra o Prana em um único momento; o ataque recebe efeitos especiais determinados pela Postura ativa."},
     paths:[{name:"Iaijutsu",focus:"Saque, precisão e primeiro golpe",areas:"Saque Rápido, Corte Inicial, Iaijutsu, Contra-Corte, Corte do Horizonte"},
            {name:"Bushido",focus:"Disciplina, resistência e domínio mental",areas:"Código, Disciplina, Espírito Inabalável, Sacrifício, Lâmina Absoluta"}]},
    {id:"c8",name:"Guardião",type:"Física",resource:"Prana",resourceMax:25,lucidityMax:80,attrs:"Instinto, Força e Presença",
     identity:"A linha entre os aliados e o perigo. Sua função não é apenas sobreviver - é impedir que os outros sejam destruídos.",
     features:[{name:"Proteção",desc:"Usa Reações para proteger aliados: receber parte do dano, reduzi-lo, alterar o alvo de um ataque ou impedir deslocamentos."}],
     impulse:{name:"Eu Estou Aqui",desc:"Concentra Prana para assumir a atenção do campo de batalha; inimigos são atraídos para si enquanto aliados recebem proteção."},
     paths:[{name:"Muralha",focus:"Defesa absoluta",areas:"Armadura, Bloqueio, Resistência, Defesa de Área, Fortaleza Viva"},
            {name:"Campeão",focus:"Proteger através da ofensiva",areas:"Contra-ataques, Interceptação, Desafios, Vingança, Campeão Imortal"}]},
    {id:"c9",name:"Patrulheiro",type:"Física",resource:"Prana",resourceMax:25,lucidityMax:80,attrs:"Agilidade/Precisão, Instinto e Inteligência",
     identity:"O especialista em caça, rastreamento, sobrevivência e combate à distância.",
     features:[{name:"Foco",desc:"Escolhe um alvo e concentra a atenção nele, recebendo benefícios crescentes - dano, rastreio, ignorar cobertura, revelar fraquezas."}],
     impulse:{name:"Caçada Perfeita",desc:"Transforma o Foco em uma caçada implacável, gastando Prana para benefícios significativos contra o alvo por período limitado."},
     paths:[{name:"Caçador",focus:"Eliminar alvos",areas:"Marca, Precisão, Armadilhas, Tiro Mortal, Predador Supremo"},
            {name:"Companheiro",focus:"Trabalhar com uma criatura companheira",areas:"Companheiro, Comandos, Ataques Combinados, Sentidos Compartilhados, Caçada em Dupla"}]},
    {id:"c10",name:"Bárbaro",type:"Física",resource:"Prana",resourceMax:20,lucidityMax:80,attrs:"Força, Presença e Instinto",
     identity:"Canaliza o Prana através da fúria, não da disciplina - a entrega total ao instinto e à emoção crua.",
     features:[{name:"Fúria Primordial",desc:"Entra em estado de Fúria gastando Prana: bônus de dano e resistência, mas perda de precisão/sutileza; pode escalar em combate prolongado."},{name:"Fúria Insensível",desc:"Em Fúria, pode negar uma perda de Lucidez de Acontecimento em combate gastando 1 Prana - o efeito é adiado, não removido."}],
     impulse:{name:"Fúria Descontrolada",desc:"Abandona qualquer contenção gastando muito Prana: poder excepcional por período limitado, mas perde parte do controle sobre as próprias ações."},
     paths:[{name:"Fúria",focus:"Dano bruto e resistência através da raiva",areas:"Fúria Crescente, Regeneração, Golpes Selvagens, Intimidação Primal, Avatar da Fúria"},
            {name:"Instinto Selvagem",focus:"Instinto, percepção e ataques reflexivos",areas:"Reflexos Animais, Percepção Primitiva, Contra-Investidas, Fúria Silenciosa, Espírito da Fera"}]},
    {id:"c11",name:"Ladino",type:"Física",resource:"Prana",resourceMax:20,lucidityMax:80,attrs:"Agilidade/Precisão, Presença e Instinto",
     identity:"Vence através de velocidade, precisão, oportunidade e astúcia - assassino, espião, explorador, acrobata, ladrão ou infiltrador.",
     features:[{name:"Oportunidade",desc:"Recebe benefícios ao atacar em situações favoráveis: distração, furtividade, posicionamento, surpresa ou terreno."}],
     impulse:{name:"Golpe Impossível",desc:"Usa Prana, velocidade e precisão para uma ação normalmente muito difícil; o efeito depende da situação."},
     paths:[{name:"Assassino",focus:"Eliminar alvos rapidamente",areas:"Veneno, Emboscada, Golpe Crítico, Execução, Morte Silenciosa"},
            {name:"Trapaceiro",focus:"Manipulação e imprevisibilidade",areas:"Ilusões, Enganação, Mobilidade, Truques, Caos Controlado"}]},
    {id:"c12",name:"Guerreiro",type:"Física",resource:"Prana",resourceMax:15,lucidityMax:80,attrs:"Força, Presença ou Agilidade/Precisão",
     identity:"O maior especialista em combate marcial geral - não precisa de uma forma específica de combate para ser eficaz.",
     features:[{name:"Maestria Marcial",desc:"Técnica de combate adaptável ao estilo do jogador: Arma Pesada, Duas Armas, Escudo, Arma de Haste ou Combate à Distância."}],
     impulse:{name:"Surto de Combate",desc:"Usa Prana para ultrapassar temporariamente seus limites, realizando uma ação adicional ou potencializando uma ação existente."},
     paths:[{name:"Mestre de Armas",focus:"Dominar diferentes armas e estilos",areas:"Armas pesadas, duas armas, combate à distância"},
            {name:"Guardião Marcial",focus:"Defesa, controle e proteção",areas:"Escudo, resistência, reações defensivas"}]}
  ],

  spells: [
    {id:"s1",name:"Nota Encorajadora",class:"Bardo",circle:1,levelMin:1,mana:10,attr:"Presença",range:"Perto",damage:"",effect:"Entoa uma frase curta e poderosa a um aliado: ele recebe vantagem no próximo teste ou recupera 1 ponto de Lucidez."},
    {id:"s2",name:"Sussurro Perturbador",class:"Bardo",circle:1,levelMin:1,mana:10,attr:"Presença",range:"Perto",damage:"",effect:"Planta uma dúvida ou distração na mente de um alvo: o próximo teste dele é feito com desvantagem, a menos que resista."},
    {id:"s3",name:"Sinfonia do Campo de Batalha",class:"Bardo",circle:2,levelMin:2,mana:20,attr:"Presença",range:"Longe",damage:"",effect:"Performance que atinge uma área curta: aliados recebem vantagem no próximo teste, inimigos recebem desvantagem."},
    {id:"s4",name:"Toque Curativo",class:"Druida",circle:1,levelMin:1,mana:10,attr:"Instinto",range:"Melee",damage:"",effect:"Ao tocar um aliado, remove uma marca de dano Menor ou reduz em um nível a severidade de um dano recente não resolvido."},
    {id:"s5",name:"Garras da Fera",class:"Druida",circle:1,levelMin:1,mana:10,attr:"Instinto",range:"Melee",damage:"d6 PHY",effect:"As mãos assumem forma de garras afiadas, permitindo ataque corpo a corpo natural até o fim da cena."},
    {id:"s6",name:"Chamado da Tempestade",class:"Druida",circle:2,levelMin:2,mana:20,attr:"Instinto",range:"Longe",damage:"d8 MAG",effect:"Invoca rajada de vento e raios sobre área curta, causando dano a todos os alvos ali presentes."},
    {id:"s7",name:"Luz Purificadora",class:"Serafim",circle:1,levelMin:1,mana:10,attr:"Presença",range:"Perto",damage:"",effect:"Luz suave sobre um aliado: remove marca de dano Menor ou reduz em um nível efeito de corrupção leve."},
    {id:"s8",name:"Julgamento Radiante",class:"Serafim",circle:1,levelMin:1,mana:10,attr:"Presença",range:"Perto",damage:"d6 MAG",effect:"Concentra energia espiritual num golpe de luz; contra criaturas corrompidas/aberrantes, o dado de dano aumenta em um grau."},
    {id:"s9",name:"Escudo dos Devotos",class:"Serafim",circle:2,levelMin:2,mana:20,attr:"Presença",range:"Perto",damage:"",effect:"Barreira espiritual ao redor de si e aliados próximos: cada um reduz a severidade do próximo dano em um nível, uma vez cada."},
    {id:"s10",name:"Descarga Arcana",class:"Feiticeiro",circle:1,levelMin:1,mana:10,attr:"Presença",range:"Longe",damage:"d6 MAG",effect:"Explosão instintiva de energia bruta contra um alvo; não exige preparação ou círculo mágico."},
    {id:"s11",name:"Fluxo Instável",class:"Feiticeiro",circle:1,levelMin:1,mana:10,attr:"Presença",range:"Perto",damage:"",effect:"Distorce a mana ao redor de forma imprevisível (luz, ruído, vento, temperatura); uma vez por cena, cria vantagem tática improvisada."},
    {id:"s12",name:"Sobrecarga Elemental",class:"Feiticeiro",circle:2,levelMin:2,mana:20,attr:"Presença",range:"Longe",damage:"d8 MAG",effect:"Ultrapassa o fluxo natural da Mana para amplificar a explosão: cada +10 Mana investida aumenta o dado de dano em um grau. Ligada ao Impulso Sobrecarga."},
    {id:"s13",name:"Mísseis Arcanos",class:"Mago",circle:1,levelMin:1,mana:10,attr:"Inteligência",range:"Longe",damage:"d6 MAG",effect:"Círculo mágico compacto dispara projéteis certeiros contra um alvo; dificilmente erra mesmo em más condições de visibilidade."},
    {id:"s14",name:"Barreira Prismática",class:"Mago",circle:1,levelMin:1,mana:10,attr:"Inteligência",range:"Perto",damage:"",effect:"Círculo mágico defensivo à frente; enquanto ativo, reduz a severidade do próximo dano recebido em um nível."},
    {id:"s15",name:"Círculo de Teleporte Menor",class:"Mago",circle:2,levelMin:2,mana:20,attr:"Inteligência",range:"Perto",damage:"",effect:"Círculo temporário que se conecta a um ponto visível dentro do alcance, permitindo deslocamento instantâneo. Exige linha de visão clara."}
  ],

  techniques: [
    {id:"t1",name:"Golpe Fendente",class:"Guerreiro",grade:1,levelMin:1,prana:5,attr:"Força",type:"Impacto",effect:"Concentra toda a força em um golpe: +d6 de dano adicional.",tool:"Arma de Duas Mãos: gaste 1 Prana adicional para aumentar o dado bônus em um grau."},
    {id:"t2",name:"Investida Dupla",class:"Guerreiro",grade:1,levelMin:1,prana:5,attr:"Agilidade/Precisão",type:"Sequência",effect:"Dois ataques rápidos encadeados contra o mesmo alvo ou próximos; o segundo causa metade do dano do primeiro.",tool:"Duas Armas: gaste 1 Prana adicional para um terceiro golpe."},
    {id:"t3",name:"Postura de Combate",class:"Guerreiro",grade:2,levelMin:2,prana:8,attr:"Presença",type:"Defesa",effect:"Postura equilibrada entre ataque e defesa; até o próximo turno, reduz a severidade de um dano em um nível.",tool:"Escudo: gaste 1 Prana adicional para proteger também um aliado próximo."},
    {id:"t4",name:"Bloqueio Absoluto",class:"Guardião",grade:1,levelMin:1,prana:5,attr:"Força",type:"Defesa",effect:"Posiciona-se entre um aliado e o perigo: o próximo ataque contra esse aliado é redirecionado para você.",tool:"Escudo: gaste 1 Prana adicional para reduzir a severidade do dano redirecionado em um nível."},
    {id:"t5",name:"Provocação",class:"Guardião",grade:1,levelMin:1,prana:5,attr:"Presença",type:"Utilidade",effect:"Chama a atenção de inimigos próximos, forçando-os a ter uma razão forte para atacá-lo antes de outro alvo.",tool:""},
    {id:"t6",name:"Muralha Viva",class:"Guardião",grade:2,levelMin:2,prana:8,attr:"Instinto",type:"Resistência",effect:"Firma-se no lugar, extremamente difícil de mover ou derrubar; reduz a severidade do próximo dano em um nível.",tool:"Armadura Pesada/Muito Pesada: gaste 1 Prana adicional para reduzir em dois níveis."},
    {id:"t7",name:"Tiro Certeiro",class:"Patrulheiro",grade:1,levelMin:1,prana:5,attr:"Agilidade/Precisão",type:"Precisão",effect:"Mira cuidadosamente antes de disparar: +d6 de dano adicional, ignora parte da Evasão por cobertura.",tool:"Arma à Distância: gaste 1 Prana adicional para ignorar cobertura completa."},
    {id:"t8",name:"Marca de Caça",class:"Patrulheiro",grade:1,levelMin:1,prana:5,attr:"Instinto",type:"Utilidade",effect:"Marca um alvo como sua Caça; enquanto o Foco estiver ativo, ataques contra ele recebem benefícios crescentes.",tool:""},
    {id:"t9",name:"Tiro Duplo",class:"Patrulheiro",grade:2,levelMin:2,prana:8,attr:"Agilidade/Precisão",type:"Precisão",effect:"Dispara dois projéteis quase simultâneos contra o mesmo alvo ou alvos próximos no alcance.",tool:"Arma à Distância: gaste 1 Prana adicional para que o segundo projétil atinja um alvo diferente."},
    {id:"t10",name:"Golpe Furtivo",class:"Ladino",grade:1,levelMin:1,prana:5,attr:"Agilidade/Precisão",type:"Sequência",effect:"Ao atacar um alvo distraído/desprotegido/em desvantagem: +d6 de dano adicional.",tool:"Duas Armas: gaste 1 Prana adicional para repetir o bônus num segundo ataque da sequência."},
    {id:"t11",name:"Passo nas Sombras",class:"Ladino",grade:1,levelMin:1,prana:5,attr:"Agilidade/Precisão",type:"Mobilidade",effect:"Move-se rapidamente por um espaço curto, ignorando ataques de oportunidade durante o deslocamento.",tool:"Armadura Leve: gaste 1 Prana adicional para ignorar também terreno difícil."},
    {id:"t12",name:"Fenda Precisa",class:"Ladino",grade:2,levelMin:2,prana:8,attr:"Agilidade/Precisão",type:"Impacto",effect:"Mira um ponto vulnerável: +d8 de dano adicional; em Sucesso com Esperança, o dano sobe um grau de severidade.",tool:""},
    {id:"t13",name:"Golpe Selvagem",class:"Bárbaro",grade:1,levelMin:1,prana:5,attr:"Força",type:"Impacto",effect:"Ataca com força bruta descontrolada: +d6 de dano adicional, mas o próximo teste de precisão/sutileza tem desvantagem.",tool:"Arma de Duas Mãos: gaste 1 Prana adicional para aumentar o dado bônus em um grau."},
    {id:"t14",name:"Grito de Guerra",class:"Bárbaro",grade:1,levelMin:1,prana:5,attr:"Presença",type:"Utilidade",effect:"Grito capaz de gelar o sangue: inimigos próximos sofrem desvantagem no próximo teste de resistência mental.",tool:""},
    {id:"t15",name:"Fúria Ascendente",class:"Bárbaro",grade:2,levelMin:2,prana:8,attr:"Força",type:"Resistência",effect:"A Fúria se intensifica a cada golpe recebido: cada dano sofrido após usar concede bônus crescente de dano no próximo ataque, até o fim do combate.",tool:""},
    {id:"t16",name:"Corte Relâmpago",class:"Samurai",grade:1,levelMin:1,prana:5,attr:"Agilidade/Precisão",type:"Impacto",effect:"Corte executado com velocidade extrema logo ao sacar a lâmina: +d6 de dano; só pode ser o primeiro ataque do combate.",tool:"Pressupõe arma de Uma Mão guardada até o saque."},
    {id:"t17",name:"Postura da Água",class:"Samurai",grade:1,levelMin:1,prana:5,attr:"Instinto",type:"Defesa",effect:"Assume a Postura da Água, priorizando reação: até o próximo turno, ganha Reação adicional para reduzir a severidade de um dano em um nível.",tool:""},
    {id:"t18",name:"Corte do Horizonte",class:"Samurai",grade:2,levelMin:2,prana:8,attr:"Agilidade/Precisão",type:"Impacto",effect:"Corte amplo e decisivo ao final de uma sequência: +d8 contra um alvo, ou +d6 dividido entre até dois alvos próximos.",tool:""},
    {id:"t19",name:"Punho Sequencial",class:"Monge",grade:1,levelMin:1,prana:5,attr:"Agilidade/Precisão",type:"Sequência",effect:"Encadeia golpes desarmados rápidos: dois ataques contra o mesmo alvo, o segundo com metade do dano. Alimenta o Fluxo Interior.",tool:""},
    {id:"t20",name:"Palma que Desvia",class:"Monge",grade:1,levelMin:1,prana:5,attr:"Instinto",type:"Defesa",effect:"Desvia um golpe recebido com as próprias mãos, reduzindo a severidade do dano em um nível, sem armadura ou escudo.",tool:""},
    {id:"t21",name:"Golpe do Vazio",class:"Monge",grade:2,levelMin:2,prana:8,attr:"Agilidade/Precisão",type:"Impacto",effect:"Libera toda a energia do Fluxo Interior em um golpe desarmado: +d8 de dano, aumentado um grau por golpe conectado na cena. Ligada ao Impulso Vazio Interior.",tool:""}
  ],

  items: [
    {id:"i1",category:"Arma",name:"Espada Longa",tier:1,attr:"Força",range:"Melee",damage:"d8+2",dtype:"PHY",burden:"1 mão",feature:"",desc:"Arma marcial padrão, versátil e confiável."},
    {id:"i2",category:"Arma",name:"Espada do Crepúsculo",tier:2,attr:"Agilidade",range:"Melee",damage:"d8+3",dtype:"PHY",burden:"1 mão",feature:"Corte Crepuscular: uma vez por cena, ao obter Sucesso com Esperança num ataque, gaste o Mana/Prana gerado para +1d6 de dano.",desc:"Lâmina élfica que brilha como o entardecer."},
    {id:"i3",category:"Arma",name:"Cajado Arcano",tier:1,attr:"Inteligência",range:"Longe",damage:"d8+2",dtype:"MAG",burden:"2 mãos",feature:"Canalização: ao conjurar magia de área, gaste 1 Mana para aumentar o alcance em uma categoria.",desc:"Ferramenta de conjuração e arma ao mesmo tempo."},
    {id:"i4",category:"Arma",name:"Varinha de Safira",tier:2,attr:"Inteligência",range:"Longe",damage:"d8+2",dtype:"MAG",burden:"1 mão",feature:"Foco Rápido: uma vez por cena, gaste 1 Mana para conjurar sem a ação adicional normalmente exigida.",desc:"Núcleo mágico semiconsciente que reconhece o encantamento proferido."},
    {id:"i5",category:"Armadura",name:"Gambeson",tier:1,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"Flexible: +1 Evasão.",desc:"Armadura Leve - Major 5, Severe 11, Armor Score 3. Prioriza mobilidade."},
    {id:"i6",category:"Armadura",name:"Couro",tier:1,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"",desc:"Armadura Média - Major 6, Severe 13, Armor Score 3. Equilibra mobilidade e proteção."},
    {id:"i7",category:"Armadura",name:"Cota de Malha",tier:1,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"Heavy: -1 Evasão.",desc:"Armadura Pesada - Major 7, Severe 15, Armor Score 4. Prioriza proteção."},
    {id:"i8",category:"Armadura",name:"Placas",tier:2,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"Very Heavy: -2 Evasão e -1 Agilidade.",desc:"Armadura Muito Pesada - Major 8, Severe 17, Armor Score 4. Proteção extrema."},
    {id:"i9",category:"Armadura",name:"Armadura de Escamas",tier:2,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"Resistente: ao marcar o último Armor Slot, role 1d6; com 6, reduz a severidade sem marcar o Slot.",desc:"Major 9, Severe 20, Armor Score 4."},
    {id:"i10",category:"Ferramenta Mágica",name:"Grimório do Astrólogo",tier:2,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"Preparação: durante um descanso, prepare uma magia adicional.",desc:"Grimório voltado a conhecimento e preparação."},
    {id:"i11",category:"Ferramenta Mágica",name:"Orbe Lunar",tier:2,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"Foco Astral: gaste 1 Mana para aumentar em uma categoria o alcance de uma magia.",desc:"Orbe voltado a controle e manipulação."},
    {id:"i12",category:"Item Mágico",name:"Talismã de Proteção",tier:2,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"Barreira: uma vez por descanso, ao sofrer dano mágico, perca 1 Lucidez para reduzir a severidade em um nível.",desc:"Acessório protetor contra dano mágico."},
    {id:"i13",category:"Consumível",name:"Poção de Cura",tier:1,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"",desc:"Limpa 1d4 HP ao ser consumida."},
    {id:"i14",category:"Consumível",name:"Poção de Vigor",tier:1,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"",desc:"Recupera 1d4 pontos de Lucidez."},
    {id:"i15",category:"Consumível",name:"Elixir Arcano",tier:1,attr:"",range:"",damage:"",dtype:"",burden:"",feature:"",desc:"Recupera uma quantidade determinada de Mana (escala com o Tier)."}
  ],

  characters: [],

  particularities: [
    {id:"pt_viciado",name:"Viciado",category:"Comportamento",description:"Você desenvolveu uma dependência física ou psicológica por uma substância, comportamento ou atividade específica.",effect:"Após satisfazer seu vício, sua próxima rolagem de teste recebe +1d4+1. Ao obter Sucesso com Esperança, recebe +1 ponto adicional do recurso gerado.",trigger:"Satisfazer o vício; Sucesso com Esperança; estar sob efeito durante combate.",limitation:"Enquanto estiver sob efeito do vício durante um combate, perde 2 de Lucidez por turno.",hyperfocus:"Após permanecer um período sem satisfazer o vício, ao fazê-lo recebe 25 de Lucidez Temporária.",abstinence:"Enquanto não estiver sob efeito do vício, sua Lucidez fica limitada a 50% do valor original. Role 1d4 para determinar seus Dados de Abstinência. Quando o Mestre determinar, role a quantidade indicada como desvantagem de 1d4."},
    {id:"pt_artista_marcial",name:"Artista Marcial",category:"Treinamento",description:"Você possui treinamento especializado em combate desarmado.",effect:"Seus ataques desarmados podem ser utilizados com Técnicas que exijam treinamento marcial, conforme aprovação do Mestre.",trigger:"Sempre que uma regra ou Técnica reconhecer treinamento marcial.",limitation:"Nenhuma específica."},
    {id:"pt_artesao",name:"Artesão",category:"Profissão",description:"Você possui conhecimento e prática na fabricação, reparo e manutenção de objetos.",effect:"Você pode fabricar, reparar e avaliar objetos quando possuir ferramentas e materiais apropriados. Em testes diretamente relacionados ao ofício, recebe +1d4.",trigger:"Testes de fabricação, reparo ou avaliação de objetos.",limitation:"Exige ferramentas e materiais quando a atividade exigir."},
    {id:"pt_cozinheiro",name:"Cozinheiro",category:"Profissão",description:"Você sabe preparar refeições capazes de sustentar e beneficiar um grupo.",effect:"Durante um descanso, pode preparar uma refeição usando ingredientes apropriados. Quem consumir a refeição pode receber um benefício definido pela qualidade e pelos ingredientes.",trigger:"Preparação e consumo de uma refeição preparada por você.",limitation:"Exige ingredientes e tempo de preparo."},
    {id:"pt_gigante",name:"Gigante",category:"Característica Física",description:"Seu corpo possui tamanho e força muito superiores ao padrão de sua espécie.",effect:"Você pode carregar mais peso, utilizar equipamentos Grandes e possuir maior alcance corporal quando o Mestre considerar apropriado.",trigger:"Situações em que seu tamanho e força sejam relevantes.",limitation:"Pode sofrer dificuldades em espaços pequenos e ter problemas para utilizar equipamentos comuns."},
    {id:"pt_espada_colossal",name:"Espada Colossal",category:"Equipamento",description:"Você possui treinamento para utilizar uma espada de proporções extraordinárias.",effect:"Você pode equipar uma Espada Colossal. Ela ocupa os dois espaços de arma e possui propriedades próprias de Impacto, além de poder habilitar Técnicas exclusivas.",trigger:"Enquanto estiver empunhando uma Espada Colossal.",limitation:"Não pode utilizar uma arma secundária enquanto estiver empunhando a Espada Colossal."}
  ]
};

/* ---------------------------------------------------------------------
   Mecânicas - conteúdo estático (referência de regras do livro, não editável)
   --------------------------------------------------------------------- */
const MECHANICS = [
  {title:"Duality Dice (2d12)",body:"O padrão de rolagem usa dois d12: um de Hope (a favor do personagem) e um de Fear (contra ele). Soma-se o resultado combinado ao Atributo relevante e compara-se com a Dificuldade. Se Hope > Fear num sucesso: Sucesso com Esperança (gera Mana/Prana). Se Fear > Hope num sucesso: Sucesso com Medo (o Mestre pode complicar)."},
  {title:"Dificuldades de Referência",body:"",table:[["Trivial","8"],["Fácil","11"],["Média","14"],["Difícil","17"],["Muito Difícil","20"],["Quase Impossível","23+"]]},
  {title:"Vantagem e Desvantagem",body:"Role um d6 adicional. Vantagem: some o maior entre ele e o valor do teste. Desvantagem: subtraia esse resultado. Não se acumulam além de um d6 cada; se ambas estiverem presentes, cancelam-se."},
  {title:"Sucesso com Esperança",body:"Gera 3 Mana (classes mágicas) ou 1 Prana (classes físicas), utilizável imediatamente, inclusive para ativar Features."},
  {title:"Condições",body:"",table:[["Vulnerável","Desvantagem em Evasão; ataques contra ele têm Vantagem"],["Restringido","Não pode se mover nem usar Técnicas/magias de Mobilidade"],["Enfraquecido","Desvantagem em testes de Força ou Agilidade"],["Atordoado","Perde a próxima Ação principal"],["Amedrontado","Desvantagem contra a fonte do medo; não se aproxima voluntariamente"]]},
  {title:"Descanso",body:"Curto: recupera 1/4 de Vida e 1/4 de Mana/Prana, libera habilidades 'uma vez por descanso curto'. Longo: recupera toda Vida e todo Mana/Prana, libera habilidades 'uma vez por descanso longo'. Lucidez não se recupera automaticamente por descanso."},
  {title:"Morte e Inconsciência",body:"Ao chegar a 0 de Vida, role os Duality Dice sem Atributo. Hope prevalecente: consciente com 1 Vida + Cicatriz. Fear prevalecente: inconsciente, começa a morrer. Dupla 12: levanta com metade da Vida máxima + Vantagem. Dupla 1: morte imediata."},
  {title:"Progressão de Nível e Tier",body:"",table:[["Nível 1","Tier I · Proficiência 1"],["Nível 2 a 4","Tier II · Proficiência 2"],["Nível 5 a 7","Tier III · Proficiência 3"],["Nível 8 a 10","Tier IV · Proficiência 4"],["Nível 11 a 13","Tier V · Proficiência 5"],["Nível 14 a 16","Tier VI · Proficiência 6"],["Nível 17 a 20","Tier VII · Proficiência 7"]]},
  {title:"Lucidez - visão geral",body:"Recurso numérico de estabilidade mental. Substitui Stress/Hope-pool/sanidade de outros sistemas. Toda 'marca de Stress' equivalente vira perda direta de Lucidez (normalmente 1 a 3 pontos)."},
  {title:"Perda Catastrófica e Trauma",body:"Perder 21+ pontos de Lucidez de uma vez é uma Perda Catastrófica e gera 1 Trauma. Um Trauma reduz permanentemente o teto de Lucidez (Leve -5, Moderado -8, Grave -12, Severo -15 a -20) e carrega um gatilho/efeito próprio. Teto mínimo sugerido: 25."},
  {title:"Limite de Traumas",body:"0: Normal · 1: Marcado · 2: Abalado · 3: Fraturado · 4: Traumatizado · 5+: Colapso Permanente (alteração profunda e permanente no personagem)."},
  {title:"Ganho de Lucidez",body:"Três fontes: Uso Harmonioso (jogadas inteligentes sem comprar recurso com Lucidez na cena), Momentos Importantes da História (a critério do Mestre) e Superação (Lucidez atual abaixo de 25% do teto abre uma janela de até 3 sessões; alcançar 80% do teto concede bônus especial)."},
  {title:"Compra de Recursos com Lucidez",body:"Quando Mana/Prana zeram: 5 Lucidez = 1 Mana, ou 3 Lucidez = 1 Prana. Sempre reduz a Lucidez atual, nunca o teto, e impede o ganho por Uso Harmonioso na cena."},
  {title:"Equipamento - Tier e Dano",body:"Um personagem só equipa itens até seu próprio Tier. Dano de arma usa um dado + modificador fixo; a Proficiência determina quantos dados rolar (não aumenta o modificador). PHY = dano físico, MAG = dano mágico."},
  {title:"Armor Slots e Severidade",body:"Dano tem 3 níveis: Minor (1 HP), Major (2 HP), Severe (3 HP). Cada Armor Slot marcado reduz a severidade em um nível (Severe→Major→Minor→Nada). Armor Score máximo: 12."},
  {title:"Thresholds sem armadura",body:"Sem armadura: Armor Score 0. Major Threshold = Nível do personagem. Severe Threshold = Nível × 2. Sem Armor Score, sem Armor Slots."},
  {title:"Círculos de Magia (custo de Mana)",body:"",table:[["Círculo I (Nv.1)","10–15 Mana"],["Círculo II (Nv.2-4)","20–25 Mana"],["Círculo III (Nv.5-7)","30–40 Mana"],["Círculo IV (Nv.8-10)","45–55 Mana"],["Círculo V (Nv.11-13)","60–70 Mana"],["Círculo VI (Nv.14-16)","75–90 Mana"],["Círculo VII (Nv.17-20)","95–110 Mana"]]},
  {title:"Graus de Técnica (custo de Prana)",body:"",table:[["Grau I (Nv.1)","3–5 Prana"],["Grau II (Nv.2-4)","6–10 Prana"],["Grau III (Nv.5-7)","12–16 Prana"],["Grau IV (Nv.8-10)","18–24 Prana"],["Grau V (Nv.11-13)","26–32 Prana"],["Grau VI (Nv.14-16)","34–42 Prana"],["Grau VII (Nv.17-20)","44–55 Prana"]]},
  {title:"Tipos de Técnica e Equipamento",body:"Impacto (Duas Mãos), Sequência (Duas Armas), Defesa (Escudo), Mobilidade (Armadura Leve), Resistência (Armadura Pesada/Muito Pesada), Precisão (Arma à Distância) e Utilidade (sem bônus de equipamento) - cada combinação certa permite gastar 1 Prana extra por um efeito adicional."},
  {title:"Graus de Habilidade (Caminhos)",body:"Grau I Fundamento · Grau II Especialização · Grau III Avançada · Grau IV Mestre · Grau V Ápice. Um Caminho é uma árvore de Ramos e Nós - o jogador escolhe onde investir, não recebe tudo automaticamente."},
  {title:"Reações e Holofote",body:"Brisa e Lamentações não utiliza turnos ou iniciativa. O Mestre conduz o Holofote pela ficção. Quando uma ação cria um gatilho, outra criatura pode responder por meio de uma Reação. Reações são respostas imediatas e dependem da situação, da habilidade do personagem e de seus equipamentos."},
  {title:"Aparo",body:"Quando você for atingido por um ataque que possa ser aparado, pode usar sua Reação e rolar 1d6. Resultado 5 ou 6: o ataque é totalmente reduzido. Resultado 2, 3 ou 4: reduza a Severidade do ataque em um nível. Resultado 1: você sofre o ataque inteiro e fica Vulnerável por 1 rodada."},
  {title:"Esquiva",body:"Quando você for alvo de um ataque que possa ser evitado por movimento, use sua Reação. Você e o atacante rolam 1d6. Empate: o ataque é desviado normalmente. Vitória por 1 ou 2: você desvia normalmente. Vitória por 3 ou mais: você desvia e o atacante fica Vulnerável por 1 rodada. Se você rolar 6 e o inimigo rolar 2 ou menos, você também pode realizar um Contra-ataque."},
  {title:"Contra-ataque",body:"Quando uma Esquiva resultar em 6 contra 2 ou menos, o personagem obtém uma abertura imediata e pode realizar um Contra-ataque. O efeito específico do Contra-ataque será definido pelas ações, Técnicas, Classe, Caminho, arma e outras habilidades do personagem."},
  {title:"Interações de Reação",body:"Classes, Caminhos, Particularidades, armas e outros equipamentos podem criar ou modificar Reações. Uma habilidade pode melhorar Aparo, Esquiva, Contra-ataque, Intervenção ou criar uma nova resposta, mantendo o princípio de que a Reação acontece por um gatilho ficcional."},
  {title:"Particularidades",body:"Particularidades são características, conhecimentos, hábitos, condições ou especializações que tornam cada personagem único. Diferentemente das Experiences, que podem ser invocadas para receber +2 em um teste ao custo de 1 Lucidez, uma Particularidade pode alterar diretamente as regras do personagem: conceder bônus ou desvantagens, modificar Vida/Mana/Prana/Lucidez, criar recursos, ações, reações, condições, limitações ou interações especiais. Particularidades podem ser simples, como Artesão, Cozinheiro ou Artista Marcial, ou complexas, como Viciado. Uma Particularidade deve possuir uma identidade mecânica própria e não precisa obrigatoriamente possuir uma penalidade."}
];

/* ---------------------------------------------------------------------
   REAÇÕES (conteúdo estático do livro)
   --------------------------------------------------------------------- */
const REACTIONS = [
  {
    name:"Aparo", icon:"🛡️", type:"Universal", trigger:"Quando você for atingido por um ataque que possa ser aparado.",
    effect:"Use sua Reação e role 1d6.",
    results:[["5 ou 6","Aparo completo: reduza totalmente o ataque. Você não sofre o dano."],["2, 3 ou 4","Aparo parcial: reduza a Severidade do ataque em um nível."],["1","Falha no Aparo: sofra o ataque completo e fique Vulnerável por 1 rodada."]],
    interactions:["Escudos podem receber habilidades que ampliem ou fortaleçam o Aparo.","Guardião pode especializar-se em Aparo e proteção.","Armas defensivas ou estilos marciais podem conceder respostas adicionais ao Aparo."]
  },
  {
    name:"Esquiva", icon:"🏃", type:"Universal", trigger:"Quando você for alvo de um ataque que possa ser evitado por movimento.",
    effect:"Você e o atacante rolam 1d6 e comparam os resultados.",
    results:[["Empate","O ataque é desviado normalmente."],["Você vence por 1 ou 2","O ataque é desviado normalmente."],["Você vence por 3 ou mais","O ataque é desviado e o atacante fica Vulnerável por 1 rodada."],["Você rola 6 e o inimigo 2 ou menos","Além de desviar, você pode realizar um Contra-ataque."]],
    interactions:["Armaduras leves podem favorecer estilos baseados em mobilidade.","Samurai, Monge, Ladino e Patrulheiro podem receber especializações ligadas à Esquiva.","Habilidades podem modificar o valor rolado, os gatilhos ou o efeito da Esquiva."]
  },
  {
    name:"Contra-ataque", icon:"⚔️", type:"Especial", trigger:"Quando uma Esquiva resultar em 6 contra 2 ou menos, ou quando uma habilidade criar uma abertura para contra-atacar.",
    effect:"Você pode aproveitar a abertura imediatamente para realizar um ataque. Técnicas ou habilidades podem substituir esse ataque por efeitos específicos.",
    results:[],
    interactions:["Guerreiro pode transformar aberturas em pressão ofensiva.","Guardião pode criar Contra-ataques defensivos ou de proteção.","Samurai pode conectar Contra-ataques às suas Posturas e técnicas de lâmina.","Armas e Técnicas podem conceder efeitos adicionais quando um Contra-ataque é ativado."]
  },
  {
    name:"Intervenção", icon:"✋", type:"Especial", trigger:"Quando um aliado sofre uma ameaça que você consegue alcançar ou interferir.",
    effect:"Uma habilidade, Classe, Caminho, Particularidade ou equipamento pode permitir que você use uma Reação para proteger ou alterar a situação.",
    results:[],
    interactions:["Guardião é o principal espaço para especializações de Intervenção.","Escudos podem ampliar as situações em que a Intervenção é possível.","O custo e o efeito dependem da habilidade que concede a Reação."]
  },
  {
    name:"Interrupção", icon:"⛔", type:"Especial", trigger:"Quando uma criatura inicia uma ação que você possui meios narrativos ou mecânicos para interromper.",
    effect:"Uma habilidade específica permite responder antes que a ação seja concluída.",
    results:[],
    interactions:["Magos e outras classes podem desenvolver Interrupções contra Magias.","Técnicas podem permitir interromper ações físicas.","O equipamento pode criar formas especiais de interromper ou desarmar uma ameaça."]
  },
  {
    name:"Reação Preparada", icon:"◉", type:"Especial", trigger:"Quando você declara previamente uma condição e ela acontece na ficção.",
    effect:"Você prepara uma resposta durante uma ação ou momento apropriado. Quando o gatilho acontece, a resposta pode ser executada imediatamente.",
    results:[],
    interactions:["A preparação deve ser específica o suficiente para o Mestre reconhecer quando o gatilho ocorreu.","Habilidades podem permitir preparar Técnicas, ataques ou outras respostas."]
  }
];