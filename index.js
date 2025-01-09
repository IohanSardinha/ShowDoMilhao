const sp = SUPABASE();

const form = document.getElementById('register-form');
const message = document.getElementById('message');

const playerID = localStorage.getItem("playerID");

async function main() {  

  console.log(process.env)

    if(playerID){
      
      const {data, err} =  await sp.from("players").select("*").eq("id", playerID).single();
      
      if(!data)
        localStorage.removeItem(playerID);
      else
        window.location.replace("./question.html");
    }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.name.value;
  const id = crypto.randomUUID();

  if (!name) {
    message.textContent = 'O nome não pode ficar em branco!';
    return;
  }

  const { data, error } = await sp.from('players').insert([{ id, name }]);

  if (error) {
    message.textContent = `Error: ${error.message}`;
  } else {
    message.textContent = `Bem vinde, ${name}! Você foi registrade.`;
    
    localStorage.setItem("playerID",id);
    
    setTimeout(() => {
      window.location.replace("./question.html");
    }, 500);

  }
});

main()