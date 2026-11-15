
// 1. SUPABASE PROJECT DETAILS

const SUPABASE_URL ="https://rkykifprxauikmucqwaa.supabase.co";

const SUPABASE_KEY ="sb_publishable_3KfAGVBSTjO67XaXdvPuBQ_7doPuHST";

// 2. CONNECT SUPABASE

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. SEND FIXED MESSAGE

async function RESUME() {

    const button = document.getElementById("sendButton");
    const status = document.getElementById("status");

    button.disabled = true;
    status.textContent = "Sending message...";

    try {

        const { error } = await supabaseClient
            .from("demo_messages")
            .insert([
                { message: "RESUME" }
            ]);

        if (error) throw error;

        status.textContent =
            "Message 'hi rudhra' saved successfully!";

    } catch (error) {

        status.textContent =
            "Error: " + error.message;

    } finally {

        button.disabled = false;

    }
}

async function images_pdf() {

    const button = document.getElementById("sendButton");
    const status = document.getElementById("status");

    button.disabled = true;
    status.textContent = "Sending message...";

    try {

        const { error } = await supabaseClient
            .from("demo_messages")
            .insert([
                { message: "images_pdf" }
            ]);

        if (error) throw error;

        status.textContent =
            "Message 'hi rudhra' saved successfully!";

    } catch (error) {

        status.textContent =
            "Error: " + error.message;

    } finally {

        button.disabled = false;

    }
}
async function image_resize() {

    const button = document.getElementById("sendButton");
    const status = document.getElementById("status");

    button.disabled = true;
    status.textContent = "Sending message...";

    try {

        const { error } = await supabaseClient
            .from("demo_messages")
            .insert([
                { message: "image_resize" }
            ]);

        if (error) throw error;

        status.textContent =
            "Message 'hi rudhra' saved successfully!";

    } catch (error) {

        status.textContent =
            "Error: " + error.message;

    } finally {

        button.disabled = false;

    }
}

async function photo_sign_merger() {

    const button = document.getElementById("sendButton");
    const status = document.getElementById("status");

    button.disabled = true;
    status.textContent = "Sending message...";

    try {

        const { error } = await supabaseClient
            .from("demo_messages")
            .insert([
                { message: "photo_sign_merger" }
            ]);

        if (error) throw error;

        status.textContent =
            "Message 'hi rudhra' saved successfully!";

    } catch (error) {

        status.textContent =
            "Error: " + error.message;

    } finally {

        button.disabled = false;

    }
}
