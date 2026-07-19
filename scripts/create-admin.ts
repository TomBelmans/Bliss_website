/**
 * Maakt een beheerdersaccount aan. Er is geen publieke registratiepagina
 * (enkel je dochter logt in), dus dit script is de manier om het eerste
 * (of een extra) account aan te maken.
 *
 * Gebruik: pnpm run create-admin -- <email> <wachtwoord>
 */
import { createUser, getUserByEmail } from "@dal";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Gebruik: pnpm run create-admin -- <email> <wachtwoord>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Wachtwoord moet minstens 8 tekens lang zijn.");
    process.exit(1);
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    console.error(`Er bestaat al een gebruiker met e-mailadres "${email}".`);
    process.exit(1);
  }

  const user = await createUser(email, password);
  console.log(`Beheerdersaccount aangemaakt voor ${user.email} (id: ${user.id}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
