import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';
import './Home.css';

const Home: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [imageType, setImageType] = useState(''); // Pour stocker et afficher le type MIME

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
        // Extraction du header (type MIME) de la chaîne base64
        if (imageBase64.includes(';')) {
          const base64Header = imageBase64.split(';')[0];
          console.log("Header extrait :", base64Header);
          setImageType(base64Header);
        } else {
          console.log("Pas de header trouvé, utilisation du type par défaut image/jpeg");
          setImageType('image/jpeg'); // Par défaut si aucun header n'est trouvé
        }
        setImageUrl(imageBase64);
        setErrorMessage('');
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
      // Extraction de la partie base64 sans le préfixe
      const base64ImageData = imageUrl.includes(',')
        ? imageUrl.split(',')[1] // Enlever 'data:image/...;base64,' si présent
        : imageUrl;
      console.log("Données base64 extraites (premiers 30 caractères) :", base64ImageData.slice(0, 30) + " ...");

      const response = await fetch('https://chat-to-detectcruch-api.glitch.me/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ imageBase64: base64ImageData }),
      });
      console.log("Réponse HTTP reçue");

      const data = await response.json();
      console.log("Réponse du serveur :", data);
      if (data.error) {
        console.log("Erreur renvoyée par le serveur :", data.error);
        setErrorMessage(data.error);
      } else {
        console.log("Upload réussi");
        setErrorMessage("Image envoyée avec succès!");
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
            src={`data:${imageType};base64,${imageUrl.includes(',') ? imageUrl.split(',')[1] : imageUrl}`}
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
      </IonContent>
    </IonPage>
  );
};

export default Home;
