import bcrypt from "bcrypt";

const hash = "$2b$10$qE6XvGl/kAsKfxnmCJhDQeAymZ0EnwrpLutUq04iO.Zp3a0sV0nlG";
const password = "Nfhoaoilua200!";

const match = await bcrypt.compare(password, hash);
console.log("Совпадает:", match);
