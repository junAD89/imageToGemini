import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';
import './Home.css';

const Home: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFormat, setImageFormat] = useState<string>(''); // État pour stocker uniquement le format d'image
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fonction pour prendre une photo depuis la galerie ou l'appareil
  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,  // Utilisez la galerie ici, ou CameraSource.Camera pour prendre une photo
      });

      const imageBase64 = image.base64String || '';

      if (imageBase64) {
        // Extraire le type MIME depuis la chaîne base64
        const base64Header = imageBase64.split(';')[0];

        // Extraire uniquement le format (jpeg, png, etc.)
        const format = base64Header.split('/')[1];

        setImageFormat(format); // Stocker uniquement le format
        setImageUrl(imageBase64);
        setErrorMessage(''); // Réinitialiser les erreurs
      }
    } catch (error) {
      console.error("Erreur lors de la prise de photo:", error);
      setErrorMessage('Une erreur est survenue lors de la prise de la photo.');
    }
  };

  // Fonction pour envoyer l'image à l'API
  const uploadPicture = async () => {
    try {
      if (!imageUrl) {
        setErrorMessage('Aucune image à envoyer.');
        return;
      }

      // Extraire la partie base64 sans le préfixe 'data:image/...;base64,'
      const base64ImageData = imageUrl.split(',')[1];

      const response = await fetch('https://chat-to-detectcruch-api.glitch.me/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64ImageData }), // Envoi uniquement les données base64
      });

      const data = await response.json();
      console.log("Réponse du serveur:", data);

      if (data.error) {
        setErrorMessage(data.error); // Afficher l'erreur envoyée par le serveur
      } else {
        setErrorMessage('Image envoyée avec succès!');
      }
    } catch (err: any) {
      console.error("Erreur lors de l'envoi de l'image:", err);
      setErrorMessage('Erreur de communication avec le serveur.');
    }
  };

  const isLoggin = true;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Upload Image</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {isLoggin && <p>You are logged in</p>}

        {/* Bouton pour prendre une photo */}
        <IonButton onClick={takePicture}>
          Take Picture
        </IonButton>

        {/* Affichage de l'image capturée */}
        {imageUrl && (
          <>
            <img src={`data:image/jpeg;base64,${imageUrl}`} alt="Captured" />
            <p>Image format: {imageFormat}</p> {/* Afficher uniquement le format */}
          </>
        )}

        {/* Message d'erreur */}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

        {/* Bouton pour uploader l'image */}
        <IonButton onClick={uploadPicture}>
          Upload
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
