import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { TbPhotoPlus } from 'react-icons/tb';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
}

const ImageUpload = ({ onChange, value }: ImageUploadProps) => {
  const handleUpload = (result: any) => {
    alert('handleUpload called.');
    console.log('result', result.info?.secure_url);
    if (result.event === 'success') {
      onChange(result.info?.secure_url || '');
    } else {
      console.error('Upload failed or incomplete.');
    }
  };

  return (
    <CldUploadWidget
      onSuccess={handleUpload}
      uploadPreset={uploadPreset}
      options={{ maxFiles: 1, clientAllowedFormats: ['jpg', 'gif', 'png'] }}
    >
      {({ open }) => {
        return (
          <div
            onClick={() => open?.()}
            className='
              relative
              flex
              items-center
              justify-center
              transition
              p-20
              border-2
              border-dashed
              cursor-pointer
              hover:opacity-70
              border-neutral-300
              text-neutral-300'
          >
            <TbPhotoPlus size={50} />
            {value && (
              <div className='absolute inset-0 w-full h-full'>
                <Image className='object-cover' layout='fill' src={value} alt='Upload Image' />
              </div>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
};

export default ImageUpload;
