import os
import PIL.Image

# --- THE FIX: Patch for modern Pillow versions ---
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.Resampling.LANCZOS
# -------------------------------------------------

from moviepy.editor import VideoFileClip

def compress_video_pythonic(input_path, output_path, target_width=960):
    if not os.path.exists(input_path):
        print(f"Error: Input file '{input_path}' not found.")
        return

    try:
        # Load the video
        clip = VideoFileClip(input_path)
        
        # Resize - lowering this to 960 or 720 helps hit that 1MB goal
        clip_resized = clip.resize(width=target_width)
        
        print("Starting compression... this uses your CPU, so it might take a moment.")
        
        # Write the file
        clip_resized.write_videofile(
            output_path, 
            codec="libx264", 
            audio=False,     # Essential for small size
            fps=24,          # Standard web loop speed
            preset="slower", # Better compression
            bitrate="800k",  # Force size down (Adjust to 500k if still too big)
            threads=4
        )
        
        print(f"\nSuccess! Compressed video saved to: {output_path}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'clip' in locals():
            clip.close()

# Run it
compress_video_pythonic('01.mp4', '01_compressed.mp4')