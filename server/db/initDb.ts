import { createTable } from "./schema";

async function main() {
    try {
        await createTable();
    }
    catch(error) {
        console.error("DB initialization error", error);
    }
}

main();