const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton =  document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const pergunta = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}
   
    ## Tarefa
    Você deve responder as perguntas do usuario com base no seu conhecimento do jogo, estrarégias, builds e dicas.

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e nao tente inventar uma resposta.
    - Se a pergunta não for sobre o jogo, responda com 'Essa pergunta não é relacioda ao jogo'
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar respostas coerent.
    - Nunca responda itens que você não tenha certeza de que existem no patch atual.

    ## Resposta
    - Economize na resposta, seja direto 
    - Responda em markdown
    - Não precisa fazer saudação ou despedidas, apenas responda o que o usuário esta querendo.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build recumendada atualmente é: \n\n**itens:**\n\ncoloque os itens aqui.\n\n**runas**\n\nexemplos de runas\n\n

    ___
    Aqui está a pergunta do usuário: ${question}
  `
  
  const contents = [{
    role: 'user',
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }]
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;


  if(apiKey == '' || game == '' || question == ''){
    alert('Por favor, preencha todos os campos');
    return;
  }

  askButton.disabled = true;
  askButton.textContent = 'perguntando...';
  askButton.classList.add('loading');

  try{
    const text = await perguntarAI(question, game, apiKey);
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden');
  } catch(error) {
    console.log('Erro: ', error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = 'Perguntar';
    askButton.classList.remove('loading');
  }

}
form.addEventListener('submit', enviarFormulario);