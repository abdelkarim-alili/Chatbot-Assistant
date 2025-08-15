# Import necessary modules from Flask and other libraries
from flask import Flask, render_template, request, Response
import json
import requests
from flask_cors import CORS  # Allows cross-origin requests (useful for frontend integration)

# Create a Flask application instance
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing for all routes
CORS(app)

# Define a route for handling GET requests to /chat
@app.route('/chat', methods=['GET'])
def chat():
    # Get the user's message from the URL query string (e.g., /chat?message=Hello)
    user_message = request.args.get('message')
    
    # If no message was provided, return a 400 Bad Request
    if not user_message:
        return Response("No message provided", status=400)

    # Create a system prompt to guide the model to behave like a short, helpful assistant
    system_prompt = (
        "<|system|>You are a helpful assistant. Answer briefly in a short text.\n"
        f"<|user|>{user_message}\n"
        "<|assistant|>"
    )

    # Combine the system prompt with the user message (redundantly included again here)
    full_prompt = f"{system_prompt}\n\n {user_message}\n"

    # Define the endpoint of the local Ollama model server
    ollama_url = 'http://localhost:11434/api/generate'

    # Prepare the data payload for the POST request to Ollama
    data = {
        "model": "Your Model Here",  # Use the download model
        "prompt": full_prompt,  # Prompt sent to the model
        "stream": True,  # Enable streaming response
        "options": {
            "temperature": 0.5,  # Controls randomness; lower = more deterministic
        }
    }

    ################## Use this function if you are using deepseek-r1 ##################
    # def generate():
    #     in_think = False  # Track if we're inside a <think> block
    #     try:
    #         with requests.post(ollama_url, json=data, stream=True) as r:
    #             r.raise_for_status()

    #             for line in r.iter_lines():
    #                 if line:
    #                     chunk = json.loads(line)
    #                     text = chunk.get("response", "")

    #                     # Remove <think>...</think> blocks even if split across chunks
    #                     filtered_text = ""
    #                     i = 0
    #                     while i < len(text):
    #                         if not in_think:
    #                             # Look for start tag
    #                             start_idx = text.find("<think>", i)
    #                             if start_idx == -1:
    #                                 # No start tag, add remainder and break
    #                                 filtered_text += text[i:]
    #                                 break
    #                             else:
    #                                 # Add text before start tag, then jump past it and set in_think
    #                                 filtered_text += text[i:start_idx]
    #                                 i = start_idx + len("<think>")
    #                                 in_think = True
    #                         else:
    #                             # Look for end tag
    #                             end_idx = text.find("</think>", i)
    #                             if end_idx == -1:
    #                                 # Still inside think, skip rest of text
    #                                 i = len(text)
    #                             else:
    #                                 # End of think found, skip past it and reset in_think
    #                                 i = end_idx + len("</think>")
    #                                 in_think = False

    #                     if not chunk.get("done") and filtered_text.strip():
    #                         yield f"data: {json.dumps({'response': filtered_text})}\n\n"

    #     except Exception as e:
    #         yield f"data: {json.dumps({'response': f'Error: {str(e)}'})}\n\n"

    # return Response(generate(), mimetype='text/event-stream')



    # Define a generator function to stream responses from the model
    def generate():
        try:
            # Make a streaming POST request to the Ollama API
            with requests.post(ollama_url, json=data, stream=True) as r:
                r.raise_for_status()  # Raise error if the request fails

                # Stream each line from the response
                for line in r.iter_lines():
                    if line:
                        # Parse the JSON chunk
                        chunk = json.loads(line)

                        # Only yield if the response is not marked as "done"
                        if not chunk.get("done"):
                            yield f"data: {json.dumps({'response': chunk.get('response', '')})}\n\n"
        except Exception as e:
            # On error, send back an error message as response
            yield f"data: {json.dumps({'response': f'Error: {str(e)}'})}\n\n"

    # Return a server-sent event (SSE) stream with the generated response
    return Response(generate(), mimetype='text/event-stream')


# Entry point to run the app if this script is executed directly
if __name__ == '__main__':
    app.run(debug=True, port=5000)
