from PIL import Image

def main():
    try:
        img = Image.open("fotofez.png")
        width, height = img.size
        
        # Função para checar se a coluna é branca (R, G, B >= 245)
        def is_column_white(x):
            white_count = 0
            for y in range(height):
                pixel = img.getpixel((x, y))
                r, g, b = pixel[:3]
                if r >= 245 and g >= 245 and b >= 245:
                    white_count += 1
            return (white_count / height) > 0.95

        # Achar o início da foto (esquerda para a direita)
        left = 0
        for x in range(width):
            if not is_column_white(x):
                left = x
                break

        # Achar o fim da foto (direita para a esquerda)
        right = width - 1
        for x in range(width - 1, -1, -1):
            if not is_column_white(x):
                right = x
                break

        if left < right:
            # Margem de segurança de 2 pixels
            left = max(0, left - 2)
            right = min(width - 1, right + 2)
            
            cropped = img.crop((left, 0, right + 1, height))
            cropped.save("fotofez.png")
            print(f"Sucesso: Recortada de {width}px para {cropped.width}px (Colunas removidas: esquerda={left}, direita={width-right-1})")
        else:
            print("Não foi possível recortar: Limites inválidos.")
    except Exception as e:
        print(f"Erro ao processar imagem: {e}")

if __name__ == "__main__":
    main()
