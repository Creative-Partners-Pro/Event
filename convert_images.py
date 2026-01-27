import os
from PIL import Image

def convert_to_webp(directory):
    for root, _, files in os.walk(directory):
        for filename in files:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                filepath = os.path.join(root, filename)
                try:
                    with Image.open(filepath) as img:
                        new_filepath = os.path.splitext(filepath)[0] + '.webp'
                        img.save(new_filepath, 'webp')
                        print(f"Converted {filepath} to {new_filepath}")
                    os.remove(filepath)
                    print(f"Removed original file: {filepath}")
                except Exception as e:
                    print(f"Could not convert {filepath}: {e}")

if __name__ == "__main__":
    convert_to_webp('img')
