const sp = SUPABASE();

const tableBody = document.getElementById('table-body');
const tableFooter = document.getElementById('table-footer');
const message = document.getElementById('message');

// Helper function to display feedback
function displayMessage(content, isSuccess = true) {
  message.textContent = content;
  message.style.color = isSuccess ? 'green' : 'red';
}

// Fetch answers from all users
async function fetchAnswers() {
  const { data: answers, error } = await sp
    .from('answers')
    .select('*, questions(text, answer, value), players(name)')
    .order('question_id', { ascending: true });

  if (error) {
    displayMessage(`Um erro ocorreu ao recolher as perguntas: ${error.message}`, false);
    return [];
  }

  return answers;
}

// Populate table
async function populateTable() {
  const answers = await fetchAnswers();

  if (!answers.length) {
    displayMessage('Não há respostas para mostrar.', false);
    return;
  }

  const playersData = {};
  answers.forEach((answer) => {
    const playerName = answer.players.name;
    const question = answer.questions;
    const correct = question.answer === answer.answer;
    const earnedValue = correct ? question.value : 0;

    if (!playersData[playerName]) {
      playersData[playerName] = { total: 0, rows: [] };
    }

    playersData[playerName].rows.push(`
      <tr>
        <td>${playerName}</td>
        <td>${question.text}</td>
        <td>R$ ${question.value}</td>
        <td>${question.answer}</td>
        <td>${answer.answer || '-'}</td>
        <td>${correct ? '✅' : '❌'}</td>
        <td>R$ ${earnedValue}</td>
      </tr>
    `);
    playersData[playerName].total += earnedValue;
  });

  // Populate rows grouped by player
  let html = '';
  let highestEarner = { name: '', total: -1 };

  Object.keys(playersData).forEach((player) => {
    const { rows, total } = playersData[player];
    html += `<tr><td colspan="7"><strong>${player}</strong></td></tr>`;
    html += rows.join('');
    html += `<tr><td colspan="6">Total</td><td colspan="1">R$ ${total}</td></tr>`;
    html += "<tr><td></tr>"
    if (total > highestEarner.total) {
      highestEarner = { name: player, total };
    }
    else if(total == highestEarner.total){
      highestEarner.name = `${highestEarner.name}, ${player}`
    }
  });

  tableBody.innerHTML = html;

  // Add footer with the highest earner
  tableFooter.innerHTML = `
    <tr>
      <td colspan="5">Ganhador</td>
      <td>${highestEarner.name}</td>
      <td>R$ ${highestEarner.total}</td>
    </tr>
  `;

  displayMessage('Tabela populada com sucesso.');
}

// Initialize table on load
populateTable();
