const sp = SUPABASE();

const addQuestionForm = document.getElementById('add-question-form');
const updateAnswerForm = document.getElementById('update-answer-form');
const message = document.getElementById('message');
const restartGame = document.getElementById("restart");

// Helper function to display feedback
function displayMessage(content, isSuccess = true) {
  message.textContent = content;
  message.style.color = isSuccess ? 'green' : 'red';
}

// Add new question
addQuestionForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const {data:prevQuest, error:prevErr} = await sp.from("questions").select("answer").order('id', { ascending: false }).limit(1).single();

  console.log(prevQuest)

  if(prevQuest && prevQuest.answer == -1){
    alert("Não foi adicionada uma resposta a ultima pergunta ainda!");
    return;
  }

  const questionName = document.getElementById('question-name').value;
  const questionValue = parseInt(document.getElementById('question-value').value, 10);

  const { data, error } = await sp
    .from('questions')
    .insert([{ text: questionName, value: questionValue }]);

  if (error) {
    displayMessage(`Error adding question: ${error.message}`, false);
  } else {
    displayMessage(`Question added successfully`);
    addQuestionForm.reset();
  }
});

// Update answer field for the last question
updateAnswerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const answer = document.getElementById('question-answer').value;

  // Fetch the last question ID
  const { data: lastQuestion, error: fetchError } = await sp
    .from('questions')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (fetchError) {
    displayMessage(`Error fetching last question: ${fetchError.message}`, false);
    return;
  }

  const { data, error } = await sp
    .from('questions')
    .update({ answer })
    .eq('id', lastQuestion.id);

  if (error) {
    displayMessage(`Error updating answer: ${error.message}`, false);
  } else {
    displayMessage(`Answer updated successfully for question ID: ${lastQuestion.id}`);
    updateAnswerForm.reset();
  }
});

restartGame.addEventListener('click', async (e)=>{
  e.preventDefault();
  if(confirm("Isso vai apagar todos os dados, tem certeza?")){
    await sp.from("players").delete().neq("name", "");
    await sp.from("answers").delete().neq("id", -1);
    await sp.from("questions").delete().neq("id", -1);
  }
});

document.getElementById("results").addEventListener('click', (e)=>{
  e.preventDefault();
  window.location.replace("./results.html")
});