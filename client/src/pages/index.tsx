import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';
import useSWR from 'swr';

import { Card } from '@/components';
import { StaleIndicator } from '@/components/loading';
import { createSSRHttpClient, endPoints, routeNames, ssrRedirect } from '@/support';
import { Category, Product } from '@/types';
import { sortIndex, sortLabel } from '@/utils';

import type { NextPageContext } from 'next';

// eslint-disable-next-line react/function-component-definition
export default function Index({
  ssrCategories,
  ssrProducts,
}: {
  ssrProducts: Product[];
  ssrCategories: Category[];
}) {
  const { t } = useTranslation('common');
  const { data: products, isValidating } = useSWR<Product[]>(endPoints.products, {
    fallbackData: ssrProducts,
  });

  const { data: categories } = useSWR<Category[]>(endPoints.categories, {
    fallbackData: ssrCategories,
  });
  const productsByCategory = categories?.map((category) => {
    const productfiltred = products?.filter((product) => product.category_id === category.id);

    return { ...category, productfiltred };
  });

  return (
    <StaleIndicator isValidating={isValidating}>
      <Head>
        <title> {`Airweb ${t`E_SHOP`}`}</title>
        <meta content="Generated by create next app" name="description" />
        <link href="/favicon.png" rel="icon" />
      </Head>
      {productsByCategory?.sort(sortIndex).map((c) => (
        <section key={c.id} className="flex flex-col justify-center">
          <div className="mx-auto 3xl:mx-[unset]">
            <h2 className="font-bold md:w-[403px] w-[386px] 3xl:w-full">{c.label}</h2>
          </div>
          <div className="flex flex-col items-center my-5 space-y-5">
            {c.productfiltred?.sort(sortLabel).map((p) => (
              <Card key={p.id} {...p} />
            ))}
          </div>
        </section>
      ))}
    </StaleIndicator>
  );
}

export const getServerSideProps = async ({ req }: NextPageContext) => {
  try {
    const httpClient = createSSRHttpClient(req);
    const ssrProducts = await httpClient.get<Product[]>(endPoints.products);
    const ssrCategories = await httpClient.get<Category[]>(endPoints.categories);

    return {
      props: { ssrProducts, ssrCategories },
    };
  } catch (error) {
    return ssrRedirect(routeNames.error);
  }
};
