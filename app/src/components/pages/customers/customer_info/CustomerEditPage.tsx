'use client'
import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { deleteRequest, patchRequest, getRequest } from '@/utils/axios';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCurrentItem, clearError, fetchCustomer, setError ,setCurrentItemValue} from '@/store/features/customer';

import { Button, useMediaQuery } from '@mui/material';
import AuthLayout from '@/components/templates/AuthLayout';
import PermissionLayout from '@/components/templates/PermissionLayout';
import MainLayout from '@/components/templates/layout/MainLayout';
import TitleBar from '@/components/atoms/TitleBar';
import MainPannel from '@/components/atoms/MainPannel';
import CustomerForm from './sections/CustomerForm';
import MemoForm from './sections/MemoForm';
import ConfirmDialog from './components/ConfirmDialog';

const CustomerEditPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const params = useSearchParams();
    const dispatch = useAppDispatch();

    const less_xl = useMediaQuery('(max-width: 1280px)');
    const [currentDialog, setCurrentDialog] = useState('');
    const prev = useAppSelector(state => state.customer.item.prev);
    const next = useAppSelector(state => state.customer.item.next);
    const currentItem = useAppSelector(state => state.customer.item.form);

    useEffect(() => {
        dispatch(fetchCustomer(`sns/${id}?${params.toString()}`));

        return () => {
            dispatch(clearCurrentItem());
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const res = await patchRequest(`/v0/customers/sns/${id}`, currentItem);
        if (res.status == 200) {
            dispatch(clearError());
        }

        if (res.status == 422 && res.data) {
            dispatch(setError(res.data));
        }
    };

    const handleDelete = async () => {
        const res = await deleteRequest(`/v0/customers/sns/${id}`, null);
        if (res.status == 200) {
            dispatch(clearError());
            router.push('/snsaccounts');
        }
    };


    const handleDisable = async () => {
        const res = await patchRequest(`/v0/customers/sns/${id}`, {is_active:!currentItem?.is_active});
        dispatch(setCurrentItemValue({ is_active: !currentItem?.is_active }))
        if (res.status == 200) {
            dispatch(clearError());
            setCurrentDialog('')
            // router.push(`/snsaccounts/${id}`);
        }
    };


    const handleRefreshToken = async () => {
        const res = await getRequest(`/v0/customers/sns/${id}/refresh`);
        if (res.status == 200) {
            const { redirectUrl } = res.data;
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
            // router.push(`/snsaccounts/${id}`);
        }else{
            dispatch(setError(res.data));
        }
    };

    return (
        <AuthLayout>
            <PermissionLayout permission={['owner', 'super', 'customer']} role={['admin', 'member']}>
                <MainLayout>
                    <TitleBar href='/customers'>顧客情報</TitleBar>

                    <MainPannel>
                        <div className='w-full h-full flex flex-col xl:flex-row gap-[24px]'>
                            <form className='w-full max-w-[600px] flex flex-col gap-[10px]' onSubmit={handleSubmit}>
                                <CustomerForm />

                                {/* ************************************************************************ */}

                                <div className='w-full mt-[16px] flex flex-col md:flex-row md:justify-between gap-[16px]'>
                                    <div className='flex gap-[8px]'>
                                        {/* <Button
                                            type='button'
                                            variant='contained'
                                            color='inherit'
                                            onClick={() => router.replace(`/customers/${prev}?${params.toString()}`)}
                                            disabled={prev == 0}
                                        >
                                            以前
                                        </Button> */}

                                        {/* <Button
                                            type='button'
                                            variant='contained'
                                            color='inherit'
                                            onClick={() => router.replace(`/customers/${next}?${params.toString()}`)}
                                            disabled={next == 0}
                                        >
                                            次に
                                        </Button> */}
                                        <Button
                                            type='button'
                                            variant='contained'
                                            color='inherit'
                                            onClick={() => setCurrentDialog('disable')}
                                            disabled={next == 0}
                                        >
                                            アカウントを無効にする  
                                            {/* {currentItem?.is_active} */}
                                        </Button>
                                    </div>

                                    <div className='flex gap-[8px]'>
                                        <Button
                                            type='button'
                                            variant='contained'
                                            color='inherit'
                                            onClick={() => router.back()}
                                        >
                                            戻る
                                        </Button>

                                        <Button
                                            type='button'
                                            variant='contained'
                                            color='inherit'
                                            onClick={handleRefreshToken}
                                        >
                                            Refresh Token
                                        </Button>

                                        <Button type='submit' variant='contained' color='secondary'>
                                            保存する
                                        </Button>

                                        <Button
                                            variant='contained'
                                            color='error'
                                            onClick={() => setCurrentDialog('delete')}
                                        >
                                            削除する
                                        </Button>
                                    </div>
                                </div>
                            </form>

                            {!less_xl && (
                                <div className='w-full h-full overflow-y-auto'>
                                    <MemoForm />
                                </div>
                            )}

                            <ConfirmDialog
                                open={currentDialog == 'delete'}
                                onClose={() => setCurrentDialog('')}
                                onConfirm={handleDelete}
                                dialogType={''}
                            />
                            <ConfirmDialog
                                open={currentDialog == 'disable'}
                                onClose={() => setCurrentDialog('')}
                                onConfirm={handleDisable}
                                dialogType={'disable'}
                            />
                        </div>
                    </MainPannel>

                    {less_xl && (
                        <div className='mt-[24px]'>
                            <MainPannel>
                                <MemoForm />
                            </MainPannel>
                        </div>
                    )}
                </MainLayout>
            </PermissionLayout>
        </AuthLayout>
    );
};

export default CustomerEditPage;
