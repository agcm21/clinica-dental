-- Asegurarse de que el campo images es un array de objetos JSON
ALTER TABLE dental_treatments 
ALTER COLUMN images SET DEFAULT '[]'::jsonb,
ALTER COLUMN images SET NOT NULL;

-- Agregar una restricción para limitar el número de imágenes
CREATE OR REPLACE FUNCTION check_images_limit()
RETURNS trigger AS $$
BEGIN
  IF jsonb_array_length(NEW.images) > 5 THEN
    RAISE EXCEPTION 'No se pueden agregar más de 5 imágenes por tratamiento';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_images_limit
  BEFORE INSERT OR UPDATE ON dental_treatments
  FOR EACH ROW
  EXECUTE FUNCTION check_images_limit();
