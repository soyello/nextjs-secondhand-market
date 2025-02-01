import Button from '@/components/Button';
import Container from '@/components/Container';
import Heading from '@/components/Heading';
import ImageUpload from '@/components/ImageUpload';
import Input from '@/components/Input';
import { categories } from '@/components/categories/Categories';
import CategoryInput from '@/components/categories/CategoryInput';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

const KakaoMap = dynamic(() => import('../../components/KakaoMap'), { ssr: false });

const ProductUploadPage = ({ isKakaoLoaded }: { isKakaoLoaded: boolean }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      latitude: 37.5665,
      longitude: 126.978,
      imageSrc: '',
      price: 10000,
    },
  });
  const imageSrc = watch('imageSrc');
  const category = watch('category');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const handleMapClick = (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post('/api/products', data)
      .then((response) => {
        router.push(`/products/${response.data.id}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Container>
      <div className='max-w-screen-lg mx-auto'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit(onSubmit)}>
          <Heading title='Product Upload' subtitle='upload your product' />
          <ImageUpload onChange={(value) => setValue('imageSrc', value)} value={imageSrc} />
          <Input id='title' label='Title' disabled={isLoading} register={register} errors={errors} required />
          <hr />
          <Input
            id='description'
            label='Description'
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <hr />
          <Input
            id='price'
            label='Price'
            formatPrice
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <hr />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto'>
            {categories.map((item) => (
              <div key={item.label} className='col-spans-1'>
                <CategoryInput
                  onClick={() => setValue('category', item.path)}
                  selected={category === item.path}
                  label={item.label}
                  icon={item.icon}
                />
              </div>
            ))}
          </div>
          <hr />
          {isKakaoLoaded ? (
            <KakaoMap latitude={latitude} longitude={longitude} onClick={handleMapClick} detailPage={false} />
          ) : (
            <p>Loading kakao Maps</p>
          )}
          <Button label='상품 생성하기' />
        </form>
      </div>
    </Container>
  );
};

export default ProductUploadPage;
