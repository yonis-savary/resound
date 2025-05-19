import handleUpload from "~/server/music/uploadHandler";

export default defineEventHandler(async (event) => {

  const formData = await readMultipartFormData(event)

  const file = formData?.find(field => field.name === 'file')
  
  if (!file) {
    return { error: 'Aucun fichier trouvé' }
  }

  const blob = new Blob([file?.data], {type: 'application/octet-stream'});
  await handleUpload(file.filename ?? 'unknown.mp3', blob);

  return {status: "OK"}
  
})
