import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent } from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';
import './Home.css';

const Home: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imageType, setImageType] = useState(''); // Pour stocker et afficher le type MIME
  const [imageDescription, setImageDescription] = useState(''); // Pour stocker la description de l'image

  // Fonction pour prendre une photo
  const takePicture = async () => {
    try {
      console.log("Début de la capture d'image avec Camera.getPhoto");
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos, // Vous pouvez passer à CameraSource.Camera pour utiliser l'appareil photo
      });
      console.log("Réponse de Camera.getPhoto :", image);

      const imageBase64 = image.base64String || '';
      console.log("Chaîne base64 obtenue :", imageBase64.slice(0, 50) + "..."); // Affiche les 50 premiers caractères

      if (imageBase64) {
        // Définir le type MIME en fonction du format renvoyé par Camera.getPhoto
        const mimeType = image.format ? `image/${image.format.toLowerCase()}` : 'image/jpeg';
        console.log("Type MIME détecté :", mimeType);
        setImageType(mimeType);
        setImageUrl(imageBase64);
        setErrorMessage('');
        // Réinitialiser la description lorsqu'une nouvelle image est prise
        setImageDescription('');
        console.log("Image et type MIME mis à jour");
      } else {
        console.log("Aucune image capturée");
      }
    } catch (err) {
      console.error("Erreur lors de la capture de l'image :", err);
      setErrorMessage("Erreur lors de la capture de l'image.");
    }
  };

  // Fonction pour uploader l'image
  const uploadPicture = async () => {
    try {
      console.log("Début de l'upload de l'image");
      if (!imageUrl) {
        console.log("Aucune image à uploader");
        setErrorMessage("Aucune image à uploader.");
        return;
      }

      // S'assurer que l'image a le préfixe MIME correct
      const formattedImageData = `data:${imageType};base64,${imageUrl}`;
      console.log("Données image formatées avec préfixe MIME :", formattedImageData.slice(0, 50) + "...");

      setErrorMessage("Envoi en cours...");

      const response = await fetch('https://chat-to-detectcruch-api.glitch.me/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ imageBase64: formattedImageData }),
      });
      console.log("Réponse HTTP reçue");

      const data = await response.json();
      console.log("Réponse du serveur :", data);
      if (data.error) {
        console.log("Erreur renvoyée par le serveur :", data.error);
        setErrorMessage(data.error);
      } else {
        console.log("Upload réussi");
        setErrorMessage("Image analysée avec succès !");
        // Stocker la description retournée par l'API
        if (data.description) {
          setImageDescription(data.description);
          console.log("Description reçue de l'API :", data.description);
        }
      }
    } catch (err: any) {
      console.error("Erreur lors de l'upload de l'image :", err);
      setErrorMessage("Erreur de communication avec le serveur.");
    }
  };

  // Fonction pour copier le type MIME dans le presse-papiers
  const copyToClipboard = async () => {
    try {
      console.log("Tentative de copie du type MIME :", imageType);
      if (imageType) {
        await navigator.clipboard.writeText(imageType);
        console.log("Type MIME copié dans le presse-papiers :", imageType);
        setErrorMessage("Type MIME copié dans le presse-papiers!");
      }
    } catch (err) {
      console.error("Erreur lors de la copie dans le presse-papiers :", err);
      setErrorMessage("Échec de la copie dans le presse-papiers.");
    }
  };

  // Fonction pour copier la description dans le presse-papiers
  const copyDescriptionToClipboard = async () => {
    try {
      if (imageDescription) {
        await navigator.clipboard.writeText(imageDescription);
        setErrorMessage("Description copiée dans le presse-papiers!");
      }
    } catch (err) {
      console.error("Erreur lors de la copie de la description :", err);
      setErrorMessage("Échec de la copie dans le presse-papiers.");
    }
  };

  const isLoggin = true;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Test des formats</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {isLoggin && <p>You are logged in</p>}

        <IonButton onClick={takePicture}>Take Picture</IonButton>

        {/* Affichage de l'image capturée */}
        {imageUrl && imageType && (
          <img
            src={`data:${imageType};base64,${imageUrl}`}
            alt="Captured"
          />
        )}

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

        <IonButton onClick={uploadPicture}>Upload</IonButton>

        {/* Affichage du type MIME récupéré et bouton de copie */}
        {imageType && (
          <div>
            <p>Type MIME de l'image: {imageType}</p>
            <IonButton onClick={copyToClipboard}>Copy MIME Type</IonButton>
          </div>
        )}

        {/* Affichage de la description de l'image */}
        {imageDescription && (
          <IonCard>
            <IonCardContent>
              <h2>Description de l'image :</h2>
              <p>{imageDescription}</p>
              <IonButton onClick={copyDescriptionToClipboard}>
                Copier la description
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;